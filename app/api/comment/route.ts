import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/app/auth";
import { createCommentSchema } from "@/lib/schemas/scriptSchema";

// Create a comment or a reply
export async function POST(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const parsed = createCommentSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 }
		);
	}

	const { content, scriptId, parentId } = parsed.data;

	try {
		const newComment = await prisma.comment.create({
			data: {
				content,
				scriptId,
				parentId,
				authorId: Number(session.user.id),
			},
			include: {
				author: { select: { id: true, name: true, image: true } },
				likedBy: { select: { id: true } },
			},
		});

		return NextResponse.json(newComment);
	} catch (error) {
		console.error("Failed to create comment:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}

// Delete a comment
export async function DELETE(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { commentId } = await req.json();
	const numericId = Number(commentId);

	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
	}

	try {
		const existing = await prisma.comment.findUnique({
			where: { id: commentId },
			select: { authorId: true },
		});

		if (!existing) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		if (existing.authorId !== Number(session.user.id)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await prisma.comment.delete({
			where: { id: numericId },
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
