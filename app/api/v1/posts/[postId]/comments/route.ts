import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import { Prisma } from "@prisma/client";
import { recordActivity, extractMentionedUserIds } from "@/lib/logActivity";

/* ------------------------------------------------------------------ */
/* Validation schemas                                                 */
/* ------------------------------------------------------------------ */

// Novel JSON
const jsonDoc = z.custom<JSONContent>(
	(val) => {
		if (typeof val !== "object" || val === null) return false;
		return (val as JSONContent).type === "doc";
	},
	{ message: "Invalid Novel document" }
);

export const commentInputSchema = z.object({
	content: jsonDoc,
	parentId: z.number().int().positive().optional(), // when replying
});

/* ------------------------------------------------------------------ */
/* GET  /api/v1/posts/[postId]/comments                               */
/* ------------------------------------------------------------------ */
export async function GET(
	req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const { searchParams } = new URL(req.url);
	const { postId } = await context.params;
	const numericPostId = Number(postId);

	const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
	const sort = searchParams.get("sort") ?? "new"; // new | top | old
	const cursor = searchParams.get("cursor"); // "timestamp_id"
	const parent = searchParams.get("parentId"); // for threaded page

	let cursorOpt: Prisma.CommentWhereUniqueInput | undefined;
	if (cursor) {
		const [timestamp, id] = cursor.split("_");
		cursorOpt = {
			createdAt: new Date(Number(timestamp)),
			id: Number(id),
		};
	}

	const orderBy: Prisma.CommentOrderByWithRelationInput[] =
		sort === "top"
			? [{ likeCount: "desc" }, { createdAt: "desc" }]
			: sort === "old"
			? [{ createdAt: "asc" }]
			: [{ createdAt: "desc" }];

	const where: Prisma.CommentWhereInput = {
		postId: numericPostId,
		deletedAt: null,
		parentId: parent ? Number(parent) : null,
	};

	const comments = await prisma.comment.findMany({
		where,
		orderBy,
		take: limit + 1,
		...(cursorOpt && { cursor: cursorOpt, skip: 1 }),
		select: {
			id: true,
			content: true,
			likeCount: true,
			replyCount: true,
			createdAt: true,
			author: { select: { id: true, name: true, image: true } },
			replies: {
				// ← pull in nested replies
				where: { deletedAt: null },
				orderBy: { createdAt: "asc" },
				select: {
					id: true,
					content: true,
					likeCount: true,
					createdAt: true,
					author: { select: { id: true, name: true, image: true } },
				},
			},
		},
	});

	const nextCursor =
		comments.length > limit
			? `${comments[limit].createdAt.getTime()}_${comments[limit].id}`
			: null;

	if (comments.length > limit) comments.pop(); // trim the extra row

	return NextResponse.json({ data: comments, nextCursor });
}

/* ------------------------------------------------------------------ */
/* POST  /api/v1/posts/[postId]/comments                              */
/* ------------------------------------------------------------------ */
export async function POST(
	req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.json();
	const parsed = commentInputSchema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

	const { content, parentId } = parsed.data;
	const { postId } = await context.params;
	const numericPostId = Number(postId);
	const authorId = Number(session.user.id);

	/*  create + bump replyCount if it's a reply                       */
	const newComment = await prisma.$transaction(async (tx) => {
		const comment = await tx.comment.create({
			data: {
				postId: numericPostId,
				parentId,
				authorId,
				content,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
				parentId: true,
				likeCount: true,
				replyCount: true,
				author: { select: { id: true, name: true, image: true } },
			},
		});

		if (parentId) {
			await tx.comment.update({
				where: { id: parentId },
				data: { replyCount: { increment: 1 } },
			});
		}

		const mentionedUserIds = extractMentionedUserIds(content);

		await recordActivity(tx, {
			actorId: Number(session.user.id),
			type: "COMMENT_POSTED",
			targetType: "COMMENT",
			targetId: numericPostId,
			postId: numericPostId,
			message: `${Number(session.user.id)} commented on your post`,
			mentions: mentionedUserIds,
		});

		return comment;
	});

	return NextResponse.json(newComment, { status: 201 });
}
