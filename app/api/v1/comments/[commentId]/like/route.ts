import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { recordActivity } from "@/lib/logActivity";

/* -------------------------------------------------------------- */
/* shared helpers                                                 */
/* -------------------------------------------------------------- */
const unauth = () =>
	NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const badId = () =>
	NextResponse.json({ error: "Invalid commentId" }, { status: 400 });

/* ============================================================== */
/*  POST   /api/v1/comments/[commentId]/like   →  add / keep like  */
/* ============================================================== */
export async function POST(
	_req: Request,
	context: { params: Promise<{ commentId: string }> }
) {
	const session = await auth();
	if (!session?.user) return unauth();

	const { commentId } = await context.params;
	const numericCommentId = Number(commentId);

	if (Number.isNaN(commentId)) return badId();
	const userId = Number(session.user.id);

	await prisma.$transaction(async (tx) => {
		try {
			await tx.commentLike.create({
				data: { userId, commentId: numericCommentId },
			});
			await tx.comment.update({
				where: { id: numericCommentId },
				data: { likeCount: { increment: 1 } },
			});
			await recordActivity(tx, {
				actorId: userId,
				type: "COMMENT_LIKED",
				targetType: "COMMENT",
				targetId: Number(commentId),
				message: `liked your comment`,
				mentions: [],
			});
		} catch (err) {
			// duplicate like (P2002) → silently ignore
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === "P2002"
			)
				return;
			throw err;
		}
	});

	return new NextResponse(null, {
		status: 201,
		headers: { Location: `/api/v1/comments/${commentId}` },
	});
}

/* ============================================================== */
/*  DELETE /api/v1/comments/[commentId]/like   →  remove like      */
/* ============================================================== */
export async function DELETE(
	_req: Request,
	context: { params: Promise<{ commentId: string }> }
) {
	const session = await auth();
	if (!session?.user) return unauth();

	const { commentId } = await context.params;
	const numericCommentId = Number(commentId);

	if (Number.isNaN(commentId)) return badId();
	const userId = Number(session.user.id);

	const deleted = await prisma.commentLike.deleteMany({
		where: { userId, commentId: numericCommentId },
	});

	if (deleted.count > 0) {
		await prisma.comment.update({
			where: { id: numericCommentId },
			data: { likeCount: { decrement: 1 } },
		});
	}

	return new NextResponse(null, { status: 204 });
}
