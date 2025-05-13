import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const MAX_LIMIT = 25; // per section
const DEFAULT_LIMIT = 10;

// Define result types
interface PostResult {
	id: number;
	title: string;
	tags: string[];
	likeCount: number;
	bookmarkCount: number;
	createdAt: Date;
	score?: number;
}

interface UserResult {
	id: number;
	name: string;
	image: string | null;
	score?: number;
}

/* ------------------------------------------------------------------ */
/* GET  /api/v1/search?q=next&limit=15                                 */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	const qRaw = searchParams.get("q")?.trim() ?? "";
	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		MAX_LIMIT
	);

	if (qRaw.length < 2) {
		return NextResponse.json({ error: "Query too short" }, { status: 400 });
	}

	const q = qRaw.toLowerCase();

	try {
		/* ---- run Post + User queries in parallel using pg_trgm --------- */
		// Using raw SQL with the similarity operator for fuzzy matching
		const rawPostQuery = Prisma.sql`
			SELECT 
				p.id, 
				p.title, 
				p.tags, 
				p."likeCount", 
				p."bookmarkCount", 
				p."createdAt",
				GREATEST(
					similarity(p.title, ${qRaw}),
					similarity(p.description, ${qRaw}),
					similarity(array_to_string_immutable(p.tags, ' '), ${qRaw})
				) as score
			FROM "Post" p
			WHERE 
				p.status = 'PUBLISHED' 
				AND p."deletedAt" IS NULL
				AND (
					p.title % ${qRaw}
					OR p.description % ${qRaw}
					OR array_to_string_immutable(p.tags, ' ') % ${qRaw}
				)
			ORDER BY score DESC
			LIMIT ${limit};
		`;

		const rawUserQuery = Prisma.sql`
			SELECT 
				u.id, 
				u.name, 
				u.image,
				GREATEST(
					similarity(u.name, ${qRaw}),
					similarity(COALESCE(u.email, ''), ${qRaw})
				) as score
			FROM "User" u
			WHERE 
				u.name % ${qRaw}
				OR u.email % ${qRaw}
			ORDER BY score DESC
			LIMIT ${limit};
		`;

		const [postsResult, usersResult] = await Promise.all([
			prisma.$queryRaw<PostResult[]>(rawPostQuery),
			prisma.$queryRaw<UserResult[]>(rawUserQuery),
		]);
		// Extract unique tags with fuzzy matching
		const posts = postsResult.map((post) => ({
			...post,
			tags: Array.isArray(post.tags) ? post.tags : [],
		}));

		// Use string similarity for tags
		const allTags = new Set<string>();
		posts.forEach((p) => p.tags.forEach((t) => allTags.add(t)));

		// Find similar tags
		const similarTags = Array.from(allTags).filter((tag) => {
			const similarity = calculateStringSimilarity(tag.toLowerCase(), q);
			return similarity > 0.4; // Threshold for similarity
		});

		similarTags.sort((a, b) => {
			const simA = calculateStringSimilarity(a.toLowerCase(), q);
			const simB = calculateStringSimilarity(b.toLowerCase(), q);
			return simB - simA;
		});

		const tags = similarTags.slice(0, limit);

		/* ---- response --------------------------------------------------- */
		return NextResponse.json({ posts, users: usersResult, tags });
	} catch (error) {
		console.error("Search error:", error);
		return NextResponse.json(
			{ error: "Failed to perform search" },
			{ status: 500 }
		);
	}
}

// Simple string similarity function for client-side tag matching
function calculateStringSimilarity(str1: string, str2: string): number {
	if (str1 === str2) return 1;
	if (str1.length === 0 || str2.length === 0) return 0;

	// Basic substring check for quick matching
	if (str1.includes(str2) || str2.includes(str1)) {
		const minLength = Math.min(str1.length, str2.length);
		const maxLength = Math.max(str1.length, str2.length);
		return minLength / maxLength;
	}

	// Levenshtein distance implementation for more complex matching
	const len1 = str1.length;
	const len2 = str2.length;
	const matrix: number[][] = Array(len1 + 1)
		.fill(null)
		.map(() => Array(len2 + 1).fill(null));

	for (let i = 0; i <= len1; i++) matrix[i][0] = i;
	for (let j = 0; j <= len2; j++) matrix[0][j] = j;

	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1, // deletion
				matrix[i][j - 1] + 1, // insertion
				matrix[i - 1][j - 1] + cost // substitution
			);
		}
	}

	// Convert distance to similarity score (0 to 1)
	const maxDistance = Math.max(len1, len2);
	return 1 - matrix[len1][len2] / maxDistance;
}
