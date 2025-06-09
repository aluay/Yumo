import { prisma } from "../db";
import type { PostPayload } from "@/lib/validation";
import { JSONContent } from "novel";

/**
 * Get "hot" posts based on a combination of factors like:
 * - Recency
 * - Like count
 * - Comment count
 * - Bookmark count
 */
export async function getHotPosts({
	limit = 10,
	cursor,
}: {
	limit?: number;
	cursor?: number | null;
}): Promise<{ posts: PostPayload[]; nextCursor: number | null }> {
	// Fetch posts with their like count, bookmark count, and comment count
	const posts = await prisma.post.findMany({
		where: {
			status: "PUBLISHED",
			deletedAt: null,
			...(cursor ? { id: { lt: cursor } } : {}),
		},
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
			commentCount: true,
			createdAt: true,
			updatedAt: true,
			author: { select: { id: true, name: true, image: true } },
			_count: { select: { comments: true } },
			slug: true,
		},
		orderBy: [
			// Start with newest posts
			{ createdAt: "desc" },
		],
		take: limit + 1,
	});

	// Calculate hotness score for each post
	const now = new Date().getTime();
	const scoredPosts = posts.map((post) => {
		const postAge = (now - post.createdAt.getTime()) / (1000 * 60 * 60) + 2; // Age in hours + 2 to avoid division by small numbers

		// Score factors (weights can be adjusted)
		const likeScore = post.likeCount * 1.5;
		const bookmarkScore = post.bookmarkCount * 2.5;
		const commentScore = post._count.comments * 2.0;

		// Calculate hotness score - higher values mean "hotter" posts
		const hotScore =
			(likeScore + bookmarkScore + commentScore) / Math.pow(postAge, 1.8);

		return {
			...post,
			hotScore,
		};
	});

	// Sort posts by score (highest to lowest)
	scoredPosts.sort((a, b) => b.hotScore - a.hotScore);

	// Handle pagination
	const nextCursor = scoredPosts.length > limit ? scoredPosts.pop()!.id : null;
	// Remove the internal score property and format for API response
	const formattedPosts = scoredPosts.map((post) => ({
		...post,
		content: post.content as JSONContent,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
		commentCount: post.commentCount ?? post._count.comments ?? 0, // ensure commentCount is set
		hotScore: undefined, // explicitly unset the hotScore property
	}));

	return {
		posts: formattedPosts as PostPayload[],
		nextCursor,
	};
}
