import prisma from "@/lib/prisma";
import { type scriptPayloadSchemaType } from "@/lib/schemas/scriptSchema";
import type { JSONContent } from "@tiptap/react";
import { ActivityLog, UserProfile } from "@/lib/schemas/scriptSchema";

// Get scripts for ScriptsList, UserScripts, userBookmarks components
export async function fetchScripts(
	endpoint: string
): Promise<scriptPayloadSchemaType[]> {
	const res = await fetch(endpoint);

	if (!res.ok) {
		throw new Error(`Failed to fetch scripts from ${endpoint}`);
	}

	const data = await res.json();
	return data;
}

// Get a single script by id
export async function getScriptById(scriptId: number, userId?: number) {
	const script = await prisma.script.findUnique({
		where: {
			id: scriptId,
			...(userId && { authorId: userId }),
		},
		include: {
			author: {
				select: { name: true, image: true },
			},
			likedBy: {
				select: { id: true },
			},
			bookmarkedBy: {
				select: { id: true },
			},
		},
	});

	if (!script) return null;

	return {
		...script,
		createdAt: script.createdAt.toISOString(),
		updatedAt: script.updatedAt.toISOString(),
		description: script.description ?? undefined,
		tags: script.tags ?? [],
		content:
			script.content &&
			typeof script.content === "object" &&
			"type" in script.content
				? (script.content as JSONContent)
				: { type: "doc", content: [] },
		author: script.author ?? undefined,
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
export async function getUserProfile(userId: number): Promise<UserProfile> {
	const res = await fetch(`/api/user/${userId}/profile`);
	if (!res.ok) throw new Error("Failed to fetch user profile");
	return res.json();
}
