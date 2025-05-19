import { UserProfileInterface, type PostPayload } from "@/lib/validation/post";
import { prisma } from "../db";
import { JSONContent } from "novel";
import { NotificationPayload } from "@/lib/validation/post";
import { Prisma } from "@prisma/client";

const BASE_URL =
	typeof window === "undefined"
		? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		: "";
/*-----------------------------------------------------------------*/
/*--------------GET ALL PUBLISHED POSTS----------------------------*/
/*-----------------------------------------------------------------*/
export async function getPosts({
	limit = 10,
	cursor,
	sort = "new",
}: {
	limit?: number;
	cursor?: number | null;
	sort?: "new" | "top" | "hot";
}): Promise<{ posts: PostPayload[]; nextCursor: number | null }> {
	// If sort is "hot", use the hot posts algorithm
	if (sort === "hot") {
		return import("./hotPosts").then((module) =>
			module.getHotPosts({ limit, cursor })
		);
	}

	const orderBy: Prisma.PostOrderByWithRelationInput =
		sort === "top" ? { likeCount: "desc" } : { createdAt: "desc" };

	const posts = await prisma.post.findMany({
		where: { status: "PUBLISHED", deletedAt: null },
		orderBy,
		take: limit + 1,
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
			slug: true,
		},
	});

	const nextCursor = posts.length > limit ? posts.pop()!.id : null;

	return {
		posts: posts.map((post) => ({
			...post,
			content: post.content as JSONContent,
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		})),
		nextCursor,
	};
}

/*-----------------------------------------------------------------*/
/*--------GET ALL POSTS THAT CONTAIN A SPECIFIC TAG----------------*/
/*-----------------------------------------------------------------*/
export async function getTagPosts(tagName: string): Promise<PostPayload[]> {
	const posts = await prisma.post.findMany({
		where: { tags: { has: tagName }, status: "PUBLISHED" },
		orderBy: { createdAt: "desc" },
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
			author: {
				select: { id: true, name: true, image: true },
			},
			_count: { select: { comments: true } },
			slug: true,
		},
	});

	// Fix types
	return posts.map((post) => ({
		...post,
		content: post.content as JSONContent,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
		commentCount: post._count.comments,
	}));
}

/*-----------------------------------------------------------------*/
/*-----------------GET A SINGLE POST BY ID-------------------------*/
/*-----------------------------------------------------------------*/
export async function getPostById(postId: number): Promise<PostPayload | null> {
	const post = await prisma.post.findUnique({
		where: { id: postId, status: "PUBLISHED", deletedAt: null },
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
			author: {
				select: { id: true, name: true, image: true },
			},
			_count: { select: { comments: true } },
			slug: true,
		},
	});
	if (!post) return null;
	return {
		...post,
		content: post.content as JSONContent,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
		commentCount: post._count.comments,
	};
}

/*-----------------------------------------------------------------*/
/*--------GET USERS FOR THE MENTIONS EXTENSIONS--------------------*/
/*-----------------------------------------------------------------*/
export async function searchUsersForMentions(query: string) {
	if (!query.trim()) return [];

	try {
		const res = await fetch(`/api/v1/users?q=${query}`);
		if (!res.ok) {
			console.error("Failed to fetch users");
			return [];
		}

		const json = await res.json();
		const users = json.data;

		// Normalize data if needed
		return users.map((user: { id: number; name: string }) => ({
			id: user.id,
			label: user.name,
		}));
	} catch (error) {
		console.error("Error fetching users for mentions", error);
		return [];
	}
}

/*-----------------------------------------------------------------*/
/*-----------------CHECK IF USER IS FOLLOWING A TAG----------------*/
/*-----------------------------------------------------------------*/
export async function isUserFollowingTag(
	userId: number,
	tag: string
): Promise<boolean> {
	try {
		const res = await fetch(`${BASE_URL}/api/v1/users/${userId}/tags`);
		if (!res.ok) {
			console.error("Failed to fetch user's tags");
			return false;
		}

		const data = await res.json();
		const followedTags = data.data || [];

		// Check if the tag is in the list of followed tags
		return followedTags.some(
			(followedTag: { tag: string }) =>
				followedTag.tag.toLowerCase() === tag.toLowerCase()
		);
	} catch (error) {
		console.error("Error checking if user follows tag:", error);
		return false;
	}
}

/*-----------------------------------------------------------------*/
/*----------CHECK IF USER IS FOLLOWING ANOTHER USER----------------*/
/*-----------------------------------------------------------------*/
export async function isUserFollowingUser(
	currentUserId: number,
	targetUserId: number
): Promise<boolean> {
	if (!currentUserId || !targetUserId) return false;
	const res = await fetch(`/api/v1/users/${targetUserId}/followers`);
	if (!res.ok) return false;
	const data = await res.json();
	return data.followers.some((f: { id: number }) => f.id === currentUserId);
}

/*-----------------------------------------------------------------*/
/*---------------------------FOLLOW A TAG--------------------------*/
/*-----------------------------------------------------------------*/
export async function followTag(tag: string): Promise<boolean> {
	try {
		const res = await fetch(`/api/v1/tags/${encodeURIComponent(tag)}/follow`, {
			method: "POST",
		});

		return res.ok;
	} catch (error) {
		console.error("Error following tag:", error);
		return false;
	}
}

/*-----------------------------------------------------------------*/
/*---------------------------UNFOLLOW A TAG------------------------*/
/*-----------------------------------------------------------------*/
export async function unfollowTag(tag: string): Promise<boolean> {
	try {
		const res = await fetch(`/api/v1/tags/${encodeURIComponent(tag)}/follow`, {
			method: "DELETE",
		});

		return res.ok;
	} catch (error) {
		console.error("Error unfollowing tag:", error);
		return false;
	}
}

/*-----------------------------------------------------------------*/
/*---------------------GET USER PROFILE----------------------------*/
/*-----------------------------------------------------------------*/
export async function getUserProfile(userId: number): Promise<
	| (UserProfileInterface & {
			followerCount: number;
			followingCount: number;
			followers: { id: number; name: string; image: string | null }[];
			following: { id: number; name: string; image: string | null }[];
	  })
	| null
> {
	if (isNaN(userId)) return null;
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			website: true,
			bio: true,
			pageContent: true,
			showEmail: true,
			posts: {
				where: { deletedAt: null },
				select: {
					id: true,
					title: true,
					description: true,
					tags: true,
					content: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					likes: { select: { userId: true } },
					bookmarks: { select: { userId: true } },
					likeCount: true,
					bookmarkCount: true,
					author: { select: { id: true, name: true, image: true } },
					_count: { select: { comments: true } },
					slug: true,
				},
			},
			comments: {
				select: {
					id: true,
					content: true,
					createdAt: true,
					updatedAt: true,
					deletedAt: true,
					likeCount: true,
					replyCount: true,
					reportCount: true,
					authorId: true,
					author: { select: { id: true, name: true, image: true } },
					post: { select: { id: true, title: true } },
					likes: { select: { userId: true } },
					reports: { select: { userId: true } },
					replies: {
						select: {
							id: true,
							content: true,
							createdAt: true,
							updatedAt: true,
							deletedAt: true,
							likeCount: true,
							replyCount: true,
							reportCount: true,
							authorId: true,
						},
					},
				},
			},
			followers: {
				select: { follower: { select: { id: true, name: true, image: true } } },
			},
			following: {
				select: {
					following: { select: { id: true, name: true, image: true } },
				},
			},
			createdAt: true,
			updatedAt: true,
		},
	});
	if (!user) return null;
	// Fix pageContent type for compatibility
	const pageContent = user.pageContent as JSONContent | null;
	const followers = user.followers.map((f) => f.follower);
	const following = user.following.map((f) => f.following);

	// Fix posts type for compatibility
	const posts = user.posts.map((post) => ({
		...post,
		content: post.content as JSONContent,
		createdAt:
			post.createdAt instanceof Date
				? post.createdAt.toISOString()
				: post.createdAt,
		updatedAt:
			post.updatedAt instanceof Date
				? post.updatedAt.toISOString()
				: post.updatedAt,
		commentCount: post._count.comments,
	}));

	// Fix comments type for compatibility
	const comments = user.comments.map((comment) => ({
		...comment,
		content: comment.content as JSONContent,
		createdAt:
			comment.createdAt instanceof Date
				? comment.createdAt.toISOString()
				: comment.createdAt,
		updatedAt:
			comment.updatedAt instanceof Date
				? comment.updatedAt.toISOString()
				: comment.updatedAt,
		deletedAt:
			comment.deletedAt instanceof Date
				? comment.deletedAt.toISOString()
				: comment.deletedAt,
		postId: comment.post?.id ?? 0,
		post: comment.post,
		author: comment.author,
		likes: comment.likes,
		reports: comment.reports,
		replies: (comment.replies ?? []).map((reply) => ({
			...reply,
			content: reply.content as JSONContent,
			createdAt:
				reply.createdAt instanceof Date
					? reply.createdAt.toISOString()
					: reply.createdAt,
			updatedAt:
				reply.updatedAt instanceof Date
					? reply.updatedAt.toISOString()
					: reply.updatedAt,
			deletedAt:
				reply.deletedAt instanceof Date
					? reply.deletedAt.toISOString()
					: reply.deletedAt,
			author: comment.author, // fallback, since reply author is not selected
			post: comment.post, // fallback, since reply post is not selected
			postId: comment.post?.id ?? 0,
			likeCount: reply.likeCount,
			replyCount: reply.replyCount,
			reportCount: reply.reportCount,
			authorId: reply.authorId,
			likes: [],
			reports: [],
			replies: [],
		})),
	}));

	// Ensure follower/following image is string|null
	const followersFixed = followers.map((f) => ({
		id: f.id,
		name: f.name,
		image: f.image ?? null,
	}));
	const followingFixed = following.map((f) => ({
		id: f.id,
		name: f.name,
		image: f.image ?? null,
	}));

	return {
		...user,
		pageContent,
		posts,
		comments,
		followerCount: followers.length,
		followingCount: following.length,
		followers: followersFixed,
		following: followingFixed,
	};
}

/*-----------------------------------------------------------------*/
/*---------------------GET USER NOTIFICATIONS----------------------*/
/*-----------------------------------------------------------------*/
export async function getUserNotifications({
	limit = 20,
	cursor,
	includeRead = false,
}: {
	limit?: number;
	cursor?: number | null;
	includeRead?: boolean;
} = {}): Promise<{
	notifications: NotificationPayload[];
	nextCursor: number | null;
}> {
	try {
		// Build query params
		const params = new URLSearchParams({
			limit: limit.toString(),
		});

		if (cursor) {
			params.append("cursor", cursor.toString());
		}

		if (includeRead) {
			params.append("all", "1");
		}

		const response = await fetch(`/api/v1/notifications?${params.toString()}`);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to fetch notifications");
		}

		const { data, nextCursor } = await response.json();

		return {
			notifications: data,
			nextCursor,
		};
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return {
			notifications: [],
			nextCursor: null,
		};
	}
}

/*-----------------------------------------------------------------*/
/*----------MARK NOTIFICATION A SINGLE AS READ---------------------*/
/*-----------------------------------------------------------------*/
export async function markNotificationAsRead(
	notificationId: number
): Promise<boolean> {
	try {
		const response = await fetch("/api/v1/notifications", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: notificationId }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to mark notification as read");
		}

		const data = await response.json();
		return data.success;
	} catch (error) {
		console.error("Failed to mark notification as read:", error);
		return false;
	}
}

/*-----------------------------------------------------------------*/
/*-----------------MARK ALL NOTIFICATIONS AS READ------------------*/
/*-----------------------------------------------------------------*/
export async function markAllNotificationsAsRead(): Promise<boolean> {
	try {
		const response = await fetch("/api/v1/notifications", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ all: true }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || "Failed to mark all notifications as read"
			);
		}

		const data = await response.json();
		return data.success;
	} catch (error) {
		console.error("Failed to mark all notifications as read:", error);
		return false;
	}
}

/*-----------------------------------------------------------------*/
/*--------------------DELETE NOTIFICATION--------------------------*/
/*-----------------------------------------------------------------*/
export async function deleteNotification(
	notificationId: number
): Promise<boolean> {
	try {
		const response = await fetch(`/api/v1/notifications?id=${notificationId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to delete notification");
		}

		const data = await response.json();
		return data.success;
	} catch (error) {
		console.error("Failed to delete notification:", error);
		return false;
	}
}

/*-----------------------------------------------------------------*/
/*--------------------GET TOP TAGS---------------------------------*/
/*-----------------------------------------------------------------*/
export async function getTopTags(
	limit: number,
	session: { user?: { id: number } } | null
) {
	// Get all tags
	const tags = await prisma.tag.findMany({
		orderBy: { postCount: "desc" },
		take: limit,
		select: {
			name: true,
			follows: { select: { userId: true } },
		},
	});

	// For each tag, get the current count of non-deleted posts
	const tagsWithCounts = await Promise.all(
		tags.map(async (tag) => {
			const postCount = await prisma.post.count({
				where: { tags: { has: tag.name }, deletedAt: null },
			});
			return {
				name: tag.name,
				postCount,
				isFollowing: tag.follows.some(
					(follow) => follow.userId === session?.user?.id
				),
			};
		})
	);
	return tagsWithCounts;
}

/*-----------------------------------------------------------------*/
/*-----------------GET USER'S BOOKMARKED POSTS---------------------*/
/*-----------------------------------------------------------------*/
export async function getUserBookmarkedPosts({
	userId,
	includeCount = false,
}: {
	userId: number;
	includeCount?: boolean;
}) {
	try {
		// Get total count if requested
		const totalCount = includeCount
			? await prisma.postBookmark.count({ where: { userId } })
			: undefined;

		// Get all bookmarks with minimal post data
		const bookmarks = await prisma.postBookmark.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			include: {
				post: {
					select: {
						id: true,
						title: true,
						tags: true,
						createdAt: true,
						updatedAt: true,
						author: {
							select: { id: true, name: true, image: true },
						},
						slug: true,
					},
				},
			},
		});

		// Transform results to include bookmark date and post data
		const results = bookmarks.map((bookmark) => ({
			post: {
				...bookmark.post,
				createdAt: bookmark.post.createdAt.toISOString(),
				updatedAt: bookmark.post.updatedAt.toISOString(),
			},
			bookmarkedAt: bookmark.createdAt.toISOString(),
		}));

		return {
			data: results,
			totalCount,
		};
	} catch (error) {
		console.error("Error fetching bookmarked posts:", error);
		return { data: [], totalCount: 0 };
	}
}
