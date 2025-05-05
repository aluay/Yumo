import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logActivity, deleteActivity } from "@/lib/api/logActivity";

// Bookmark a post
export async function POST(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { id } = await context.params;
	const postId = Number(id);
	if (isNaN(postId)) {
		return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
	}

	const bookmarkedPost = await prisma.user.update({
		where: { id: Number(session.user.id) },
		data: {
			bookmarkedPosts: {
				connect: { id: postId },
			},
		},
	});

	await logActivity({
		userId: Number(session.user.id),
		type: "POST_BOOKMARKED",
		targetId: bookmarkedPost.id,
		message: `You bookmarked a post`,
	});
	return NextResponse.json({ success: true });
}

// Un-bookmark a post
export async function DELETE(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await context.params;
	const postId = Number(id);
	if (isNaN(postId)) {
		return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
	}

	const unbookmarkedPost = await prisma.user.update({
		where: { id: Number(session.user.id) },
		data: {
			bookmarkedPosts: {
				disconnect: { id: postId },
			},
		},
	});

	await deleteActivity(
		Number(session?.user.id),
		"POST_BOOKMARKED",
		unbookmarkedPost.id
	);

	return NextResponse.json({ success: true });
}
