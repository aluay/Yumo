import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	_req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	const numericUserId = Number(userId);

	if (Number.isNaN(numericUserId))
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });

	const posts = await prisma.post.findMany({
		where: {
			bookmarks: { some: { userId: numericUserId } },
			deletedAt: null,
		},
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			title: true,
			description: true,
			tags: true,
			content: true,
			status: true,
			likes: { select: { userId: true } },
			likeCount: true,
			bookmarks: { select: { userId: true } },
			bookmarkCount: true,
			createdAt: true,
			updatedAt: true,
			author: { select: { id: true, name: true, image: true } },
			_count: { select: { comments: true } },
		},
	});
	return NextResponse.json({ data: posts });
}
