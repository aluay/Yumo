import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { JSONContent } from "novel";

/* -------------------------------------------------------------------------- */
/* GET /api/v1/library                                                        */
/* -------------------------------------------------------------------------- */
/* Query params:
     ?limit   – max rows (default 10, cap 50)
     ?cursor  – last bookmark.createdAt_postId for pagination
     ?sort    – "recent" (default) or "oldest"
*/
export async function GET(req: Request) {
	const session = await auth();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = Number(session.user.id);
	const { searchParams } = new URL(req.url);

	// Pagination and sorting params
	const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
	const cursor = searchParams.get("cursor"); // "timestamp_postId"
	const sort = searchParams.get("sort") ?? "recent"; // recent | oldest
	const includeCount = searchParams.get("includeCount") === "true";

	let cursorData: { createdAt: Date; postId: number } | undefined;
	if (cursor) {
		const [timestamp, postId] = cursor.split("_");
		cursorData = {
			createdAt: new Date(Number(timestamp)),
			postId: Number(postId),
		};
	}

	// Define the order based on sort parameter
	const orderBy: Prisma.PostBookmarkOrderByWithRelationInput = {
		createdAt: sort === "oldest" ? "asc" : "desc",
	};
	try {
		// Get total count if requested
		let totalCount;
		if (includeCount) {
			totalCount = await prisma.postBookmark.count({ where: { userId } });
		}

		// Get bookmarks with their associated posts
		const bookmarks = await prisma.postBookmark.findMany({
			where: {
				userId,
				...(cursorData
					? {
							// Filter for cursor-based pagination
							OR: [
								{
									createdAt: {
										[sort === "oldest" ? "gt" : "lt"]: cursorData.createdAt,
									},
								},
								{
									AND: [
										{ createdAt: cursorData.createdAt },
										{
											postId: {
												[sort === "oldest" ? "gt" : "lt"]: cursorData.postId,
											},
										},
									],
								},
							],
					  }
					: {}),
			},
			orderBy: [
				orderBy,
				{ postId: sort === "oldest" ? "asc" : "desc" }, // Secondary sort by postId for stable pagination
			],
			take: limit + 1, // +1 to check if there's more
			include: {
				post: {
					select: {
						id: true,
						title: true,
						description: true,
						tags: true,
						content: true,
						status: true,
						likeCount: true,
						bookmarkCount: true,
						commentCount: true,
						createdAt: true,
						updatedAt: true,
						author: {
							select: { id: true, name: true, image: true },
						},
						likes: { select: { userId: true } },
						bookmarks: { select: { userId: true } },
						slug: true,
					},
				},
			},
		});

		// Check if there are more results
		const hasMore = bookmarks.length > limit;
		if (hasMore) bookmarks.pop(); // Remove the extra item

		// Format the next cursor
		const nextCursor = hasMore
			? `${bookmarks[bookmarks.length - 1].createdAt.getTime()}_${
					bookmarks[bookmarks.length - 1].postId
			  }`
			: null;

		// Transform results to include bookmark date and post data
		const results = bookmarks.map((bookmark) => ({
			post: {
				...bookmark.post,
				content: bookmark.post.content as JSONContent,
				createdAt: bookmark.post.createdAt.toISOString(),
				updatedAt: bookmark.post.updatedAt.toISOString(),
			},
			bookmarkedAt: bookmark.createdAt.toISOString(),
		}));
		return NextResponse.json({
			data: results,
			nextCursor,
			totalCount: totalCount,
		});
	} catch (error) {
		console.error("Error fetching bookmarked posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch bookmarked posts" },
			{ status: 500 }
		);
	}
}
