import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { postInputSchema } from "@/lib/validation";

/* ──────────────────────────────────────────────────────────────── */
/* Helper                                                          */
/* ──────────────────────────────────────────────────────────────── */
const patchSchema = postInputSchema.partial(); // all fields optional

function notFound() {
	return NextResponse.json({ error: "Post not found" }, { status: 404 });
}

function forbidden() {
	return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/* ──────────────────────────────────────────────────────────────── */
/* GET /api/v1/posts/[postId]                                      */
/* ──────────────────────────────────────────────────────────────── */
export async function GET(
	_req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const { postId } = await context.params;
	const numericUserId = Number(postId);

	const post = await prisma.post.findFirst({
		where: { id: numericUserId, deletedAt: null },
		select: {
			id: true,
			title: true,
			description: true,
			tags: true,
			content: true,
			status: true,
			likes: { select: { userId: true } },
			likeCount: true,
			bookmarks: { select: { userId: true } },
			bookmarkCount: true,
			createdAt: true,
			updatedAt: true,
			author: { select: { id: true, name: true, image: true } },
			_count: { select: { comments: true } },
		},
	});

	if (!post) return notFound();
	return NextResponse.json(post);
}

/* ──────────────────────────────────────────────────────────────── */
/* PATCH /api/v1/posts/[postId]                                    */
/* ──────────────────────────────────────────────────────────────── */
export async function PATCH(
	req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { postId } = await context.params;
	const numericUserId = Number(postId);

	const post = await prisma.post.findUnique({
		where: { id: Number(numericUserId) },
		select: { authorId: true, deletedAt: true },
	});
	if (!post || post.deletedAt) return notFound();
	if (post.authorId !== Number(session.user.id)) return forbidden();

	const body = await req.json();
	const parsed = patchSchema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

	const { title, description, tags, status, content, category } = parsed.data;

	const updated = await prisma.post.update({
		where: { id: Number(numericUserId) },
		data: {
			...(title !== undefined && { title }),
			...(description !== undefined && { description }),
			...(tags !== undefined && { tags }),
			...(status !== undefined && { status }),
			...(category !== undefined && { category }),
			...(content !== undefined && {
				content: content ?? { type: "doc", content: [] },
			}),
		},
	});

	return NextResponse.json(updated);
}

/* ──────────────────────────────────────────────────────────────── */
/* DELETE /api/v1/posts/[postId]                                   */
/* ──────────────────────────────────────────────────────────────── */
export async function DELETE(
	_req: Request,
	context: { params: Promise<{ postId: string }> }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { postId } = await context.params;
	const numericUserId = Number(postId);

	const post = await prisma.post.findUnique({
		where: { id: Number(numericUserId) },
		select: { authorId: true, deletedAt: true },
	});
	if (!post || post.deletedAt) return notFound();
	if (post.authorId !== Number(session.user.id)) return forbidden();

	await prisma.post.update({
		where: { id: Number(numericUserId) },
		data: { deletedAt: new Date() },
	});

	return new NextResponse(null, { status: 204 });
}
