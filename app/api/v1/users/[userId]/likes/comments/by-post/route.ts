import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	const numericUserId = Number(userId);

	const { searchParams } = new URL(req.url);
	const postId = searchParams.get("postId");
	const numericPostId = postId ? Number(postId) : null;

	if (isNaN(numericUserId)) {
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
	}
	if (numericPostId === null || isNaN(numericPostId)) {
		return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
	}

	const likedComments = await prisma.commentLike.findMany({
		where: { userId: numericUserId, comment: { postId: numericPostId } },
		select: { commentId: true },
	});

	const ids = likedComments.map((r) => r.commentId);

	return NextResponse.json({ data: ids });
}
