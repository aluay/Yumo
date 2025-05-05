import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import prisma from "@/lib/prisma";
import { logActivity, deleteActivity } from "@/lib/api/logActivity";

// Like a post
export async function POST(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { postId } = await req.json();
	const numericId = Number(postId);

	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
	}
	try {
		const post = await prisma.post.findUnique({
			where: { id: numericId },
		});

		if (!post) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		const likedPosts = await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: {
				likedPosts: {
					connect: { id: numericId },
				},
			},
		});

		await logActivity({
			userId: Number(session.user.id),
			type: "POST_LIKED",
			targetId: likedPosts.id,
			message: `You liked a post`,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Like failed:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}

// Unlike a post
export async function DELETE(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { postId } = await req.json();

	const numericId = Number(postId);
	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
	}

	try {
		const unlikedPost = await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: {
				likedPosts: {
					disconnect: { id: numericId },
				},
			},
		});

		if (!unlikedPost) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		} else {
			await deleteActivity(
				Number(session?.user.id),
				"POST_LIKED",
				unlikedPost.id
			);

			return NextResponse.json({ success: true });
		}
	} catch (error) {
		console.error("Unlike failed:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}
