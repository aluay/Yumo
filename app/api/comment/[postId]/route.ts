import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildCommentTree } from "@/lib/utils";
import { JSONContent } from "novel";

// Get all comments (threaded)
export async function GET(
	req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const { postId } = await context.params;
	const numericPostId = Number(postId);

	if (isNaN(numericPostId)) {
		return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
	}

	const comments = await prisma.comment.findMany({
		where: { postId: numericPostId },
		include: {
			author: { select: { id: true, name: true, image: true } },
			likedBy: { select: { id: true } },
		},
		orderBy: { createdAt: "asc" },
	});

	const enriched = comments.map((c) => ({ ...c, replies: [] }));
	const enrichedSafe = enriched.map((c) => ({
		...c,
		content: (c.content as JSONContent) ?? { type: "doc", content: [] },
	}));
	const threaded = buildCommentTree(enrichedSafe);

	return NextResponse.json(threaded);
}
