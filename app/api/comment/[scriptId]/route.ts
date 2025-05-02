import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildCommentTree } from "@/lib/utils";
import { JSONContent } from "novel";

// Get all comments (threaded)
export async function GET(
	req: Request,
	context: { params: Promise<{ scriptId: string }> }
) {
	const { scriptId } = await context.params;
	const numericScriptId = Number(scriptId);

	if (isNaN(numericScriptId)) {
		return NextResponse.json({ error: "Invalid script ID" }, { status: 400 });
	}

	const comments = await prisma.comment.findMany({
		where: { scriptId: numericScriptId },
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
