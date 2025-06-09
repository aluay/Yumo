import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const resolvedParams = await params;
	const userId = Number(resolvedParams.userId);
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
