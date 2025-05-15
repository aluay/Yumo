import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(
	req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (Number.isNaN(numericUserId))
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });

	const { searchParams } = new URL(req.url);
	const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
	const cursor = searchParams.get("cursor");
	const sort = searchParams.get("sort") ?? "new"; // new | top | old

	const orderBy: Prisma.PostOrderByWithRelationInput =
		sort === "top" ? { likeCount: "desc" } : { createdAt: "desc" };

	const posts = await prisma.post.findMany({
		where: { authorId: numericUserId, deletedAt: null },
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
			slug: true,
		},
	});

	const nextCursor = posts.length > limit ? posts.pop()!.id : null;
	return NextResponse.json({ data: posts, nextCursor });
}
