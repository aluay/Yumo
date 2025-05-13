import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
	_req: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	const numericPostId = Number(userId);

	const comments = await prisma.comment.findMany({
		where: {
			likes: { some: { userId: numericPostId } },
			deletedAt: null,
		},
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			content: true,
			createdAt: true,
			post: { select: { id: true, title: true } },
		},
	});
	return NextResponse.json({ data: comments });
}
