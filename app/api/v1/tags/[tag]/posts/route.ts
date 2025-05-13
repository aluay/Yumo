import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/* ------------------------------------------------------------------ */
/* GET /api/v1/tags/[tag]/posts                                       */
/* ------------------------------------------------------------------ */
export async function GET(
	req: Request,
	context: { params: Promise<{ tag: string }> }
) {
	/* -------- query params ----------------------------------------- */
	const { searchParams } = new URL(req.url);

	const { tag } = await context.params;
	const rawTag = decodeURIComponent(tag).trim();

	if (!rawTag) {
		return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
	}
	const tagLowerCase = rawTag.toLowerCase(); // tags stored lower‑case

	const limit = Math.min(
		Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
		MAX_LIMIT
	);
	const cursor = searchParams.get("cursor"); // last post.id
	const sort = searchParams.get("sort") ?? "new"; // new | top | old

	const orderBy: Prisma.PostOrderByWithRelationInput[] =
		sort === "top"
			? [{ likeCount: "desc" }, { createdAt: "desc" }]
			: sort === "old"
			? [{ createdAt: "asc" }]
			: [{ createdAt: "desc" }];

	/* -------- main query ------------------------------------------- */
	const posts = await prisma.post.findMany({
		where: {
			status: "PUBLISHED",
			deletedAt: null,
			tags: { has: tagLowerCase },
		},
		orderBy,
		take: limit + 1,
		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
		select: {
			id: true,
			title: true,
			description: true,
			tags: true,
			likeCount: true,
			bookmarkCount: true,
			createdAt: true,
			author: { select: { id: true, name: true, image: true } },
			_count: { select: { comments: true } },
		},
	});

	const nextCursor = posts.length > limit ? posts.pop()!.id : null;

	return NextResponse.json({ tag: rawTag, data: posts, nextCursor });
}
