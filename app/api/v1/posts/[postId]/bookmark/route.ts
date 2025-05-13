import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { recordActivity } from "@/lib/logActivity";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function badRequest(msg: string) {
	return NextResponse.json({ error: msg }, { status: 400 });
}
function unauth() {
	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/* ──────────────────────────────────────────────────────────────────── */
/*  POST  /api/v1/posts/[postId]/bookmark   →  add / keep bookmark     */
/* ──────────────────────────────────────────────────────────────────── */
export async function POST(
	_req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const session = await auth();
	if (!session?.user) return unauth();

	const { postId } = await context.params;
	const numericPostId = Number(postId);

	if (Number.isNaN(postId)) return badRequest("Invalid postId");
	const userId = Number(session.user.id);

	/* One transaction:
     1) try to insert bookmark
     2) if inserted => increment counter
  */
	await prisma.$transaction(async (tx) => {
		try {
			await tx.postBookmark.create({ data: { userId, postId: numericPostId } });
			await tx.post.update({
				where: { id: numericPostId },
				data: { bookmarkCount: { increment: 1 } },
			});
			await recordActivity(tx, {
				actorId: userId,
				type: "POST_BOOKMARKED",
				targetType: "POST",
				targetId: numericPostId,
				message: `${userId} bookmarked your post`,
				postId: numericPostId,
				mentions: [],
			});
		} catch (err) {
			// Duplicate PK => bookmark already exists; swallow
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === "P2002"
			)
				return;
			throw err; // re‑raise anything else
		}
	});

	return new NextResponse(null, {
		status: 201,
		headers: { Location: `/api/v1/posts/${postId}` },
	});
}

/* ──────────────────────────────────────────────────────────────────── */
/*  DELETE /api/v1/posts/[postId]/bookmark   →  remove bookmark        */
/* ──────────────────────────────────────────────────────────────────── */
export async function DELETE(
	_req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const session = await auth();
	if (!session?.user) return unauth();

	const { postId } = await context.params;
	const numericPostId = Number(postId);

	if (Number.isNaN(postId)) return badRequest("Invalid postId");
	const userId = Number(session.user.id);

	const deleted = await prisma.postBookmark.deleteMany({
		where: { userId, postId: numericPostId },
	});

	if (deleted.count > 0) {
		await prisma.post.update({
			where: { id: numericPostId },
			data: { bookmarkCount: { decrement: 1 } },
		});
	}

	return new NextResponse(null, { status: 204 });
}
