import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

const MAX_FEATURED_POSTS = 5;

/* ------------------------------------------------------------------ */
/* GET  /api/v1/posts/featured                                        */
/* ------------------------------------------------------------------ */
export async function GET() {
	// Calculate dates for recency boost
	const last7Days = subDays(new Date(), 7);
	const last14Days = subDays(new Date(), 14);

	try {
		// Fetch posts with all the metrics we need for scoring
		const posts = await prisma.post.findMany({
			where: {
				status: "PUBLISHED",
				deletedAt: null,
				reportCount: {
					lt: 4, // Exclude posts with high report count
				},
			},
			orderBy: {
				createdAt: "desc", // Initially sort by recency
			},
			take: 30, // Get more than we need to apply our scoring algorithm
			select: {
				id: true,
				title: true,
				slug: true,
				likeCount: true,
				bookmarkCount: true,
				commentCount: true,
				viewCount: true,
				reportCount: true,
				createdAt: true,
				tags: true,
				author: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		// Score and sort posts
		const scoredPosts = posts
			.map((post) => {
				// Convert dates for comparison
				const createdAt = new Date(post.createdAt);

				// Apply scoring weights
				let score = 0;
				score += post.likeCount * 0.4; // 40% weight
				score += post.bookmarkCount * 0.25; // 25% weight
				score += post.commentCount * 0.2; // 20% weight
				score += post.viewCount * 0.1; // 10% weight
				score -= post.reportCount * 1.0; // Subtract 100% for reports

				// Add recency boost
				if (createdAt >= last7Days) {
					score *= 1.25; // 25% boost for posts in the last 7 days
				} else if (createdAt >= last14Days) {
					score *= 1.1; // 10% boost for posts in the last 14 days
				}

				return {
					...post,
					score,
					createdAt: post.createdAt.toISOString(),
				};
			})
			.sort((a, b) => b.score - a.score) // Sort by score descending
			.slice(0, MAX_FEATURED_POSTS); // Take top posts

		return NextResponse.json({
			posts: scoredPosts.map((post) => {
				const { ...postWithoutScore } = post; // Remove score from response
				return postWithoutScore;
			}),
		});
	} catch (error) {
		console.error("Error fetching featured posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch featured posts" },
			{ status: 500 }
		);
	}
}
