import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { JSONContent } from "@tiptap/react";

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */
const jsonDoc = z.custom<JSONContent>(
	(val) => {
		if (typeof val !== "object" || val === null) return false;
		return (val as JSONContent).type === "doc";
	},
	{ message: "Invalid Novel document" }
);

const patchSchema = z.object({
	content: jsonDoc,
});

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const notFound = () =>
	NextResponse.json({ error: "Comment not found" }, { status: 404 });

const forbidden = () =>
	NextResponse.json({ error: "Forbidden" }, { status: 403 });

/* ──────────────────────────────────────────────────────────────────── */
/*  GET /api/v1/comments/[commentId]                                   */
/* ──────────────────────────────────────────────────────────────────── */
export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ commentId: string }> }
) {
	const resolvedParams = await params;
	const id = Number(resolvedParams.commentId);
	const comment = await prisma.comment.findFirst({
		where: { id, deletedAt: null },
		select: {
			id: true,
			content: true,
			likeCount: true,
			replyCount: true,
			createdAt: true,
			updatedAt: true,
			parentId: true,
			author: { select: { id: true, name: true, image: true } },
		},
	});

	if (!comment) return notFound();
	return NextResponse.json(comment);
}

/* ──────────────────────────────────────────────────────────────────── */
/*  PATCH /api/v1/comments/[commentId]                                 */
/* ──────────────────────────────────────────────────────────────────── */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ commentId: string }> }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const resolvedParams = await params;
	const id = Number(resolvedParams.commentId);
	const comment = await prisma.comment.findUnique({
		where: { id },
		select: { authorId: true, deletedAt: true },
	});
	if (!comment || comment.deletedAt) return notFound();
	if (comment.authorId !== Number(session.user.id)) return forbidden();

	const body = await req.json();
	const parsed = patchSchema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

	const updated = await prisma.comment.update({
		where: { id },
		data: {
			content: parsed.data.content,
			updatedAt: new Date(),
		},
		select: {
			id: true,
			content: true,
			updatedAt: true,
		},
	});

	return NextResponse.json(updated);
}

/* ──────────────────────────────────────────────────────────────────── */
/*  DELETE /api/v1/comments/[commentId]                                */
/* ──────────────────────────────────────────────────────────────────── */
export async function DELETE(
	_req: Request,
	context: { params: Promise<{ commentId: string }> }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { commentId } = await context.params;
	const numericCommentId = Number(commentId);

	// fetch minimal fields for auth + parent
	const comment = await prisma.comment.findUnique({
		where: { id: numericCommentId },
		select: { authorId: true, parentId: true, deletedAt: true },
	});
	if (!comment || comment.deletedAt) return notFound();
	if (comment.authorId !== Number(session.user.id)) return forbidden();

	await prisma.$transaction(async (tx) => {
		// soft‑delete: blank content, mark deletedAt
		await tx.comment.update({
			where: { id: numericCommentId },
			data: {
				content: { type: "doc", content: [] }, // empty doc placeholder
				deletedAt: new Date(),
			},
		});

		// decrement replyCount on parent (if any)
		if (comment.parentId) {
			await tx.comment.update({
				where: { id: comment.parentId },
				data: { replyCount: { decrement: 1 } },
			});
		}
	});

	return new NextResponse(null, { status: 204 });
}
