import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { postSchema } from "@/lib/schemas/postSchema";
import { Prisma } from "@prisma/client";
import { deleteActivity } from "@/lib/api/logActivity";
import { auth } from "@/app/auth";

// Get a single post by id
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;

	const numericId = parseInt(id);
	if (isNaN(numericId)) {
		return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
	}

	const post = await prisma.post.findUnique({
		where: { id: numericId },
	});

	if (!post) {
		return NextResponse.json({ error: "Post not found" }, { status: 404 });
	}

	return NextResponse.json(post);
}

// Update a post by id
export async function PATCH(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		const numericId = parseInt(id);
		if (isNaN(numericId)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const body = await request.json();
		const parsed = postSchema.partial().safeParse(body);

		if (!parsed.success) {
			const errorMessages = parsed.error.errors.map((err) => err.message);
			return NextResponse.json({ error: errorMessages }, { status: 400 });
		}

		const data = {
			...parsed.data,
			content:
				parsed.data.content === null ? Prisma.JsonNull : parsed.data.content,
			code: parsed.data.code,
		};

		const updatedPost = await prisma.post.update({
			where: { id: numericId },
			data,
		});

		return NextResponse.json(updatedPost, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Failed to update post:", error.message);
		}
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Delete a post by id
export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		const session = await auth();
		const numericId = parseInt(id);

		if (isNaN(numericId)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const deletedPost = await prisma.post.delete({
			where: { id: numericId },
		});

		await deleteActivity(
			Number(session?.user.id),
			"POST_CREATED",
			deletedPost.id
		);

		return NextResponse.json(deletedPost);
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		console.error("Error deleting post:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
