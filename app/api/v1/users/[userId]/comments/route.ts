import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	_req: Request,
	{ params }: { params: { userId: string } }
) {
	const userId = Number(params.userId);
	const comments = await prisma.comment.findMany({
		where: { authorId: userId, deletedAt: null },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			content: true,
			createdAt: true,
			likeCount: true,
			post: { select: { id: true, title: true } },
		},
	});
	return NextResponse.json({ data: comments });
}
