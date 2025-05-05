import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;
	const userId = Number(id);

	if (isNaN(userId)) {
		return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
	}
	try {
		const posts = await prisma.post.findMany({
			where: {
				bookmarkedBy: {
					some: {
						id: userId,
					},
				},
				status: "PUBLISHED", // Only return published posts
			},
			orderBy: { createdAt: "desc" },
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				_count: {
					select: { Comment: true },
				},
			},
		});

		const safePosts = posts.map((s) => ({
			...s,
			createdAt: s.createdAt.toISOString(),
			updatedAt: s.updatedAt.toISOString(),
		}));

		return NextResponse.json(safePosts);
	} catch (err) {
		console.error("Error fetching bookmarks for user", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
