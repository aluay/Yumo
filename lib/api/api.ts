import prisma from "@/lib/prisma";
import type { JSONContent } from "@tiptap/react";
import {
	ActivityLog,
	UserProfileInterface,
	type postPayloadSchemaType,
} from "@/lib/schemas/postSchema";

// Get posts for PostsList, UserPosts, userBookmarks components
export async function fetchPosts(
	endpoint: string
): Promise<postPayloadSchemaType[]> {
	const res = await fetch(endpoint);

	if (!res.ok) {
		throw new Error(`Failed to fetch posts from ${endpoint}`);
	}

	const data = await res.json();
	return data;
}

// Get a single post by id
export async function getPostById(postId: number, userId?: number) {
	const post = await prisma.post.findUnique({
		where: {
			id: postId,
			...(userId && { authorId: userId }),
		},
		include: {
			author: {
				select: { id: true, name: true, image: true },
			},
			likedBy: {
				select: { id: true },
			},
			bookmarkedBy: {
				select: { id: true },
			},
		},
	});

	if (!post) return null;

	return {
		...post,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
		description: post.description ?? undefined,
		tags: post.tags ?? [],
		content:
			post.content && typeof post.content === "object" && "type" in post.content
				? (post.content as JSONContent)
				: { type: "doc", content: [] },
		author: post.author ?? undefined,
	};
}

// Get users for the mentions extensions
export async function searchUsersForMentions(query: string) {
	if (!query.trim()) return [];

	try {
		const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
		if (!res.ok) {
			console.error("Failed to fetch users");
			return [];
		}

		const users = await res.json();

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

// Get user activity
export async function getUserActivity(userId: number): Promise<ActivityLog[]> {
	const res = await fetch(`/api/activity/user/${userId}`);
	if (!res.ok) throw new Error("Failed to fetch user activity");
	return res.json();
}

// Get user profile
export async function getUserProfile(
	userId: number
): Promise<UserProfileInterface> {
	const res = await fetch(`/api/user/${userId}/profile`);
	if (!res.ok) throw new Error("Failed to fetch user profile");
	return res.json();
}
