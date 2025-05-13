import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { recordActivity } from "@/lib/logActivity";

/* ───────────────────────── helpers ─────────────────────────── */
const unauth = () =>
	NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const badId = () =>
	NextResponse.json({ error: "Invalid postId" }, { status: 400 });

/* ============================================================ */
/*  POST  /api/v1/posts/[postId]/like    →  add / keep like      */
/* ============================================================ */
export async function POST(
	_req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const session = await auth();
	if (!session?.user) return unauth();

	const { postId } = await context.params;
	const numericPostId = Number(postId);

	if (Number.isNaN(postId)) return badId();
	const userId = Number(session.user.id);

	await prisma.$transaction(async (tx) => {
		try {
			// 1) like the post
			await tx.postLike.create({ data: { userId, postId: numericPostId } });
			await tx.post.update({
				where: { id: numericPostId },
				data: { likeCount: { increment: 1 } },
			});
			// 2) record the activity
			await recordActivity(tx, {
				actorId: userId,
				type: "POST_LIKED",
				targetType: "POST",
				targetId: numericPostId,
				message: `liked your post`,
				mentions: [],
				postId: numericPostId,
			});
		} catch (err) {
			// ignore duplicate like attempts
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
		headers: { Location: `/api/v1/posts/${postId}` },
	});
}

/* ============================================================ */
/*  DELETE /api/v1/posts/[postId]/like   →  remove like          */
/* ============================================================ */
export async function DELETE(
	_req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const session = await auth();
	if (!session?.user) return unauth();

	const { postId } = await context.params;
	const numericPostId = Number(postId);

	if (Number.isNaN(postId)) return badId();
	const userId = Number(session.user.id);

	const deleted = await prisma.postLike.deleteMany({
		where: { userId, postId: numericPostId },
	});

	if (deleted.count > 0) {
		await prisma.post.update({
			where: { id: numericPostId },
			data: { likeCount: { decrement: 1 } },
		});
	}

	return new NextResponse(null, { status: 204 });
}
