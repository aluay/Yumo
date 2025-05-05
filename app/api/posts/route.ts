import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { postSchema, postPayloadSchema } from "@/lib/schemas/postSchema";
import { auth } from "@/app/auth";
import { Prisma } from "@prisma/client";
import { logActivity } from "@/lib/api/logActivity";

// Get all posts
export async function GET() {
	const session = await auth();

	const take = session && session.user ? undefined : 10;
	try {
		const posts = await prisma.post.findMany({
			take, // Only load recent 10 posts for unauthenticated users
			where: {
				status: "PUBLISHED",
			},
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

		return NextResponse.json(result.data);
	} catch (error) {
		console.error("Failed to fetch posts:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Create new post
export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const parsed = postSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
	}

	const data = {
		...parsed.data,
		authorId: Number(session.user.id),
		content:
			parsed.data.content === null ? Prisma.JsonNull : parsed.data.content,
		code: parsed.data.code,
	};

	const newPost = await prisma.post.create({
		data,
	});

	await logActivity({
		userId: Number(session.user.id),
		type: "POST_CREATED",
		targetId: newPost.id,
		message: `You created a post`,
	});
	return NextResponse.json(newPost, { status: 201 });
}
