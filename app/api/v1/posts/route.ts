import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { postInputSchema } from "@/lib/validation/post";
import { Prisma } from "@prisma/client";
import { extractMentionedUserIds, recordActivity } from "@/lib/logActivity";
import { JSONContent } from "novel";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";

/* ------------------------------------------------------------------ */
/* GET  /api/v1/posts                                                  */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	// 10 posts per page, max 50
	const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
	const cursor = searchParams.get("cursor")
		? Number(searchParams.get("cursor"))
		: null; // post.id of last page
	const sort = searchParams.get("sort") ?? "new"; // new | top | hot
	// If sort is "hot", use our custom hot sort logic
	if (sort === "hot") {
		// Import and use the dedicated hot posts module
		const { getHotPosts } = await import("@/lib/api/hotPosts");
		const { posts: hotPosts, nextCursor } = await getHotPosts({
			limit,
			cursor,
		});

		return NextResponse.json({
			data: hotPosts,
			nextCursor,
		});
	}

	const orderBy: Prisma.PostOrderByWithRelationInput =
		sort === "top" ? { likeCount: "desc" } : { createdAt: "desc" };

	const posts = await prisma.post.findMany({
		where: { status: "PUBLISHED", deletedAt: null },
		orderBy,
		take: limit + 1, // fetch one extra to know if next page exists
		...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
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
	const nextCursor = posts.length > limit ? posts.pop()!.id : null;

	return NextResponse.json({
		data: posts.map((post) => ({
			...post,
			content: post.content as JSONContent,
			commentCount: post._count?.comments ?? 0,
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		})),
		nextCursor,
	});
}

/* ------------------------------------------------------------------ */
/* POST  /api/v1/posts                                                 */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.json();
	const parsed = postInputSchema.safeParse(body);

	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

	const { title, description, tags, status, content } = parsed.data;

	try {
		const newPost = await prisma.$transaction(async (tx) => {
			const baseSlug = slugify(title);
			let slug = baseSlug;
			while (await tx.post.findUnique({ where: { slug } })) {
				slug = `${baseSlug}-${nanoid(6)}`;
			}

			const createdPost = await tx.post.create({
				data: {
					title,
					description,
					tags,
					status,
					content: content ?? { type: "doc", content: [] },
					authorId: Number(session.user.id),
					slug,
				},
			});

			// Upsert tags and update postCount
			for (const tagName of tags) {
				// Count posts with this tag and not soft-deleted (including the new post)
				const postCount = await tx.post.count({
					where: { tags: { has: tagName }, deletedAt: null },
				});
				await tx.tag.upsert({
					where: { name: tagName },
					update: { postCount },
					create: { name: tagName, postCount },
				});
			}

			const mentionedUserIds = extractMentionedUserIds(content as JSONContent);

			await recordActivity(tx, {
				actorId: Number(session.user.id),
				type: "POST_CREATED",
				targetType: "POST",
				targetId: Number(createdPost.id),
				message: `created a post`,
				mentions: mentionedUserIds,
				postId: Number(createdPost.id),
			});

			return createdPost;
		});

		// Build HTTP response outside the transaction
		return NextResponse.json(newPost, {
			status: 201,
			headers: { Location: `/api/v1/posts/${newPost.id}` },
		});
	} catch (err) {
		console.error("Error creating post or logging activity:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

/* ------------------------------------------------------------------ */
/* PATCH  /api/v1/posts/:id                                            */
/* ------------------------------------------------------------------ */
export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await auth();
	if (!session?.user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.json();
	const parsed = postInputSchema.safeParse(body);

	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

	const { title, description, tags, status, content } = parsed.data;
	const postId = Number(params.id);
	if (isNaN(postId))
		return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });

	try {
		const updatedPost = await prisma.$transaction(async (tx) => {
			const baseSlug = slugify(title);
			let slug = baseSlug;
			while (
				await tx.post.findFirst({ where: { slug, NOT: { id: postId } } })
			) {
				slug = `${baseSlug}-${nanoid(6)}`;
			}

			const post = await tx.post.update({
				where: { id: postId },
				data: {
					title,
					description,
					tags,
					status,
					content: content ?? { type: "doc", content: [] },
					slug,
				},
			});

			// ...existing tag upsert logic if present...
			return post;
		});
		return NextResponse.json(updatedPost);
	} catch (err) {
		console.error("Error updating post:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
