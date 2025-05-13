import {
	ActivityLog,
	UserProfileInterface,
	type PostPayload,
} from "@/lib/validation/post";
import { prisma } from "../db";
import { JSONContent } from "novel";
import { NotificationPayload } from "@/lib/validation/post";

const BASE_URL =
	typeof window === "undefined"
		? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		: "";
/*-----------------------------------------------------------------*/
/*--------------GET ALL PUBLISHED POSTS----------------------------*/
/*-----------------------------------------------------------------*/
export async function getPosts(): Promise<PostPayload[]> {
	const posts = await prisma.post.findMany({
		where: { status: "PUBLISHED" },
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
		},
	});

	// Fix types
	return posts.map((post) => ({
		...post,
		content: post.content as JSONContent,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
	}));
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
		},
	});

	// Fix types
	return posts.map((post) => ({
		...post,
		content: post.content as JSONContent,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
	}));
}

// Get a single post by id
export async function getPostById(postId: number): Promise<PostPayload> {
	const res = await fetch(`${BASE_URL}/api/v1/posts/${postId}`);
	if (!res.ok) throw new Error("Failed to fetch post");
	const post = await res.json();
	return post;
}

// Get users for the mentions extensions
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

// Check if user is following a tag
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

// Follow a tag
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

// Unfollow a tag
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

// Get user activity (CONVERT TO SERVER COMPONENT INSTEAD)
export async function getUserActivity(userId: number): Promise<ActivityLog[]> {
	const res = await fetch(`/api/v1/activity/users/${userId}`);
	if (!res.ok) throw new Error("Failed to fetch user activity");
	const json = await res.json();
	return json.data;
}

/*-----------------------------------------------------------------*/
/*---------------------GET USER PROFILE----------------------------*/
/*-----------------------------------------------------------------*/
export async function getUserProfile(
	userId: number
): Promise<UserProfileInterface | null> {
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
					author: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					post: {
						select: {
							id: true,
							title: true,
						},
					},
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
							postId: true,
							author: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
							post: {
								select: {
									id: true,
									title: true,
								},
							},
							likes: { select: { userId: true } },
							reports: { select: { userId: true } },
						},
					},
				},
			},
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) return null;

	return {
		...user,
		pageContent: user.pageContent as JSONContent | null,
		posts: user.posts.map((p) => ({
			...p,
			content: p.content as JSONContent | null,
			createdAt: p.createdAt.toISOString(),
			updatedAt: p.updatedAt.toISOString(),
		})),
		comments: user.comments.map((c) => ({
			id: c.id,
			postId: c.post.id,
			// parentId: c.parentId ?? null,
			authorId: c.author.id,
			content: c.content as JSONContent,
			createdAt: c.createdAt.toISOString(),
			updatedAt: c.updatedAt.toISOString(),
			deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
			likeCount: c.likeCount ?? 0,
			replyCount: c.replyCount ?? 0,
			reportCount: c.reportCount ?? 0,
			author: c.author,
			post: {
				id: c.post.id,
				title: c.post.title,
			},
			likes: c.likes ?? [],
			reports: c.reports ?? [],
			replies: c.replies.map((r) => ({
				id: r.id,
				postId: r.post.id,
				// parentId: r.parentId ?? null,
				authorId: r.author.id,
				content: r.content as JSONContent,
				createdAt: r.createdAt.toISOString(),
				updatedAt: r.updatedAt.toISOString(),
				deletedAt: r.deletedAt ? r.deletedAt.toISOString() : null,
				likeCount: r.likeCount ?? 0,
				replyCount: r.replyCount ?? 0,
				reportCount: r.reportCount ?? 0,
				author: r.author,
				post: {
					id: r.post.id,
					title: r.post.title,
				},
				likes: r.likes ?? [],
				reports: r.reports ?? [],
				replies: [],
			})),
		})),
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
