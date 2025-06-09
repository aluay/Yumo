import { prisma } from "./db";
import { JSONContent } from "@tiptap/react";
import { ActivityLog } from "./validation";
import {
	activityService,
	ActivityType,
	TargetType,
	ActivityPriority,
} from "./services/ActivityService";

const BASE_URL =
	typeof window === "undefined"
		? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		: "";

import { Prisma } from "@prisma/client";

/* ------------------------------------------------------------------ */
/* DEPRECATED: Legacy Types - Use ActivityService types instead       */
/* ------------------------------------------------------------------ */
// Export ActivityService types for backward compatibility
export { ActivityType, TargetType, ActivityPriority };

/* ------------------------------------------------------------------ */
/* recordActivity - DEPRECATED: Use ActivityService.logActivity       */
/* ------------------------------------------------------------------ */
export async function recordActivity(
	tx: Prisma.TransactionClient,
	{
		actorId,
		type,
		targetId,
		targetType,
		postId,
		message,
		mentions = [],
		recipientId,
	}: {
		actorId: number;
		type: ActivityType;
		targetId: number;
		targetType: TargetType;
		postId?: number;
		message?: string;
		mentions?: number[];
		recipientId?: number;
	}
) {
	// Use the new ActivityService for better functionality
	return await activityService.createActivity(
		{
			userId: actorId,
			timestamp: new Date(),
			source: "legacy_recordActivity",
		},
		{
			type,
			targetType,
			targetId,
			message,
			metadata: postId ? { postId } : null,
			mentionedUserIds: mentions,
			recipientIds: recipientId ? [recipientId] : undefined,
			priority: ActivityPriority.NORMAL,
		},
		tx // Pass the transaction to the ActivityService
	);
}

export async function deleteActivity(
	userId: number,
	type: ActivityType,
	targetId: number
) {
	try {
		await fetch(`${BASE_URL}/api/v1/activity`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				activityId: targetId, // Note: This assumes targetId is actually the activityId
			}),
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
	activity: ActivityLog & {
		post?: { title: string };
		mentions?: { user: { name: string } }[];
	}
) {
	const { type, Post, mentions } = activity;
	const mentionedNames = mentions?.map((m) => `@${m.user.name}`) ?? [];
	switch (type) {
		case "COMMENT_POSTED":
			if (mentionedNames.length > 0) {
				return `You posted a comment on "${
					Post?.title
				}" and mentioned ${mentionedNames.join(", ")}`;
			}
			return `You posted a comment on "${Post?.title}"`;

		case "POST_CREATED":
			return `You created a new post "${Post?.title}"`;

		case "POST_BOOKMARKED":
			return `You bookmarked "${Post?.title}"`;

		case "POST_LIKED":
			return `You liked "${Post?.title}"`;

		case "COMMENT_LIKED":
			return `You liked a comment in this post ${Post?.title}`;

		default:
			return "You performed an action";
	}
}
