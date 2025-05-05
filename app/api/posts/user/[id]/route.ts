import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { postPayloadSchema } from "@/lib/schemas/postSchema";

// Get all posts for a specific user
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		const numericId = parseInt(id);
		if (isNaN(numericId)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		const posts = await prisma.post.findMany({
			where: { authorId: numericId },
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const safePosts = posts.map((s) => ({
			...s,
			createdAt: s.createdAt.toISOString(),
			updatedAt: s.updatedAt.toISOString(),
		}));

		const result = postPayloadSchema.array().safeParse(safePosts);
		if (!result.success) {
			return NextResponse.json(
				{ error: result.error.format() },
				{ status: 500 }
			);
		}

		if (!result.success) {
			return NextResponse.json({ error: "No posts found" }, { status: 500 });
		}

		return NextResponse.json(result.data);
	} catch (error) {
		console.error("Failed to fetch posts:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
