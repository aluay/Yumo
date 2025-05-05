import { Activity, ActivityType } from "@prisma/client";
import prisma from "../prisma";
import { JSONContent } from "@tiptap/react";

interface LogParams {
	userId: number;
	type: ActivityType;
	targetId: number;
	message?: string;
}

const BASE_URL =
	typeof window === "undefined"
		? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		: "";

export async function logActivity({
	userId,
	type,
	targetId,
	message,
}: LogParams) {
	try {
		const res = await fetch(`${BASE_URL}/api/activity`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, type, targetId, message }),
		});

		if (!res.ok) throw new Error("Failed to log activity");

		const activity = await res.json();
		return activity;
	} catch (err) {
		console.error("Failed to log activity:", err);
		return null;
	}
}

export async function deleteActivity(
	userId: number,
	type: ActivityType,
	targetId: number
) {
	try {
		await fetch(`${BASE_URL}/api/activity`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, type, targetId }),
		});
	} catch (err) {
		console.error("Failed to delete activity:", err);
	}
}

export async function logMentions(
	activityId: number,
	mentionedUserIds: number[]
) {
	if (!mentionedUserIds.length) return;

	const mentionsData = mentionedUserIds.map((userId) => ({
		activityId,
		userId,
	}));

	try {
		await prisma.activityMention.createMany({
			data: mentionsData,
			skipDuplicates: true,
		});
	} catch (error) {
		console.error("Failed to log mentions:", error);
	}
}

// This function recursively walks the TipTap JSON tree and collects all mention IDs
export function extractMentionedUserIds(content: JSONContent): number[] {
	// Set to avoid duplicate user IDs
	const mentionedIds = new Set<number>();

	function walk(node: JSONContent) {
		if (node.type === "mention" && node.attrs?.id) {
			const idNum = Number(node.attrs.id);
			if (!isNaN(idNum)) {
				mentionedIds.add(idNum);
			}
		}
		// Recurse into children if they exist
		if (node.content && Array.isArray(node.content)) {
			for (const child of node.content) {
				walk(child);
			}
		}
	}

	walk(content);

	return Array.from(mentionedIds);
}

export function getActivityMessage(
	activity: Activity & {
		post?: { title: string };
		mentions?: { user: { name: string } }[];
	}
) {
	const { type, post, mentions } = activity;
	const postTitle = post?.title ?? "a post";
	const mentionedNames = mentions?.map((m) => `@${m.user.name}`) ?? [];

	switch (type) {
		case "COMMENT_POSTED":
			if (mentionedNames.length > 0) {
				return `You posted a comment on "${postTitle}" and mentioned ${mentionedNames.join(
					", "
				)}`;
			}
			return `You posted a comment on "${postTitle}"`;

		case "POST_CREATED":
			return `You created a new post "${postTitle}"`;

		case "POST_BOOKMARKED":
			return `You bookmarked "${postTitle}"`;

		case "POST_LIKED":
			return `You liked "${postTitle}"`;

		case "COMMENT_LIKED":
			return `You liked a comment`;

		default:
			return "You performed an action";
	}
}
