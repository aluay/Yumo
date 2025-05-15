import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const q = searchParams.get("q")?.trim() ?? "";
	const limitParam = searchParams.get("limit");
	const limit = limitParam ? parseInt(limitParam, 10) : 10;

	if (q.length < 2) {
		return NextResponse.json({ error: "Query too short" }, { status: 400 });
	}

	try {
		// Use raw SQL with trigram similarity for fuzzy search on posts
		// The pg_trgm extension allows for more efficient fuzzy matching
		const postsQuery = Prisma.sql`
      SELECT 
        id, 
        title, 
        tags, 
        "likeCount", 
        "bookmarkCount", 
        "createdAt",
        (similarity(title, ${q}) * 1.5) + similarity(description, ${q}) + 
        CASE WHEN title % ${q} THEN 0.3 ELSE 0 END +
        CASE WHEN description % ${q} THEN 0.2 ELSE 0 END +
        CASE WHEN title ILIKE ${`%${q}%`} THEN 0.4 ELSE 0 END as score
      FROM "Post"
      WHERE 
        status = 'PUBLISHED' 
        AND "deletedAt" IS NULL
        AND (
          title % ${q} 
          OR description % ${q}
          OR similarity(title, ${q}) > 0.2 
          OR similarity(description, ${q}) > 0.2
          OR title ILIKE ${`%${q}%`} 
          OR description ILIKE ${`%${q}%`}
          OR EXISTS (
            SELECT 1 FROM unnest(tags) as tag 
            WHERE tag ILIKE ${`%${q}%`} OR similarity(tag, ${q}) > 0.3
          )
        )
      ORDER BY score DESC, "createdAt" DESC
      LIMIT ${limit};
    `;

		const posts = await prisma.$queryRaw(postsQuery);

		// Enhanced fuzzy search for users with trigram similarity
		const usersQuery = Prisma.sql`
      SELECT 
        id, 
        name, 
        image,
        similarity(name, ${q}) * 2 + 
        CASE WHEN name % ${q} THEN 0.5 ELSE 0 END +
        CASE WHEN email % ${q} THEN 0.3 ELSE 0 END + 
        CASE WHEN name ILIKE ${`%${q}%`} THEN 0.4 ELSE 0 END as score
      FROM "User"
      WHERE 
        name % ${q}
        OR email % ${q}
        OR similarity(name, ${q}) > 0.2
        OR name ILIKE ${`%${q}%`} 
        OR email ILIKE ${`%${q}%`}
      ORDER BY score DESC
      LIMIT ${limit};
    `;

		const users = await prisma.$queryRaw(usersQuery);

		// Improved tag search using PostgreSQL's array functions with trigram similarity
		const tagsQuery = Prisma.sql`
      WITH post_tags AS (
        SELECT DISTINCT unnest(tags) as tag
        FROM "Post"
        WHERE 
          status = 'PUBLISHED' 
          AND "deletedAt" IS NULL
      )
      SELECT 
        tag,
        similarity(tag, ${q}) + 
        CASE WHEN tag % ${q} THEN 0.3 ELSE 0 END +
        CASE WHEN tag ILIKE ${`%${q}%`} THEN 0.3 ELSE 0 END as score
      FROM post_tags
      WHERE 
        tag % ${q}
        OR similarity(tag, ${q}) > 0.2
        OR tag ILIKE ${`%${q}%`}
      ORDER BY score DESC
      LIMIT ${limit};
    `;

		const tagResults = await prisma.$queryRaw(tagsQuery);
		const tags = (tagResults as Array<{ tag: string; score: number }>).map(
			(result) => result.tag
		);

		return NextResponse.json({ posts, users, tags });
	} catch (error: unknown) {
		console.error("Search error:", error);
		return NextResponse.json(
			{
				error: "Failed to perform search",
				details:
					typeof error === "object"
						? (error as Error).message || "Unknown error"
						: String(error),
			},
			{ status: 500 }
		);
	}
}
