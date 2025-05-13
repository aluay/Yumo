import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MAX_LIMIT = 25; // per section
const DEFAULT_LIMIT = 10;

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

	/* ---- run Post + User queries in parallel ----------------------- */
	const [posts, users] = await prisma.$transaction([
		prisma.post.findMany({
			where: {
				status: "PUBLISHED",
				deletedAt: null,
				OR: [
					{ title: { contains: qRaw, mode: "insensitive" } },
					{ description: { contains: qRaw, mode: "insensitive" } },
					{ tags: { has: q } }, // matches tag array
				],
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			select: {
				id: true,
				title: true,
				tags: true,
				likeCount: true,
				bookmarkCount: true,
				createdAt: true,
			},
		}),

		prisma.user.findMany({
			where: {
				OR: [
					{ name: { contains: qRaw, mode: "insensitive" } },
					{ email: { contains: qRaw, mode: "insensitive" } },
				],
			},
			take: limit,
			select: { id: true, name: true, image: true },
		}),
	]);

	/* ---- build tag list -------------------------------------------- */
	// If you don't have a dedicated Tag table, derive from post.tags
	const tagSet = new Set<string>();

	posts.forEach((p) =>
		p.tags.forEach((t) => {
			if (t.toLowerCase().includes(q)) tagSet.add(t);
		})
	);

	const tags = Array.from(tagSet).slice(0, limit);

	/* ---- response --------------------------------------------------- */
	return NextResponse.json({ posts, users, tags });
}
