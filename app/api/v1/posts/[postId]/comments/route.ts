import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import { Prisma } from "@prisma/client";
import {
	recordActivity,
	extractMentionedUserIds,
	ActivityType,
	TargetType,
} from "@/lib/logActivity";

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

const commentInputSchema = z.object({
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

	/* create + bump replyCount if it's a reply */
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
				post: { select: { id: true, title: true, authorId: true } },
			},
		});

		if (parentId) {
			// Increment reply count on parent comment
			await tx.comment.update({
				where: { id: parentId },
				data: { replyCount: { increment: 1 } },
			});

			// Get parent comment author to notify them about the reply
			const parentComment = await tx.comment.findUnique({
				where: { id: parentId },
				select: { authorId: true },
			});

			if (parentComment && parentComment.authorId !== authorId) {
				// Create notification for comment reply (if author is not the same)
				await recordActivity(tx, {
					actorId: authorId,
					type: ActivityType.COMMENT_POSTED,
					targetType: TargetType.COMMENT,
					targetId: comment.id, // The new comment ID
					postId: numericPostId,
					message: `replied to your comment`,
					// Don't include the parent comment author in mentions as they get a direct notification
					mentions: [],
					// Specify the recipient (parent comment author)
					recipientId: parentComment.authorId,
				});
			}
		}

		// Notify post author about the comment (if not their own post)
		if (comment.post.authorId !== authorId && !parentId) {
			await recordActivity(tx, {
				actorId: authorId,
				type: ActivityType.COMMENT_POSTED,
				targetType: TargetType.POST,
				targetId: numericPostId,
				postId: numericPostId,
				message: `commented on your post "${comment.post.title}"`,
				mentions: [],
				recipientId: comment.post.authorId,
			});
		}

		// Handle mentioned users
		const mentionedUserIds = extractMentionedUserIds(content);

		// Remove author ID from mentions (don't notify yourself)
		const filteredMentions = mentionedUserIds.filter((id) => id !== authorId);

		// Create mention-specific notifications
		for (const mentionedUserId of filteredMentions) {
			await recordActivity(tx, {
				actorId: authorId,
				type: ActivityType.USER_MENTIONED, // Create a new activity type for mentions
				targetType: parentId ? TargetType.COMMENT : TargetType.POST,
				targetId: comment.id,
				postId: numericPostId,
				message: parentId
					? `mentioned you in a reply to a comment`
					: `mentioned you in a comment on "${comment.post.title}"`,
				mentions: [], // No need for mentions here as this is already a mention notification
				recipientId: mentionedUserId,
			});
		}

		return comment;
	});

	return NextResponse.json(newComment, { status: 201 });
}
