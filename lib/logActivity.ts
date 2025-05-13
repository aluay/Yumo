import { prisma } from "./db";
import { JSONContent } from "@tiptap/react";
import { ActivityLog } from "./validation/post";

const BASE_URL =
	typeof window === "undefined"
		? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		: "";

import { Prisma } from "@prisma/client";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type ActivityType =
	| "POST_CREATED"
	| "POST_LIKED"
	| "POST_BOOKMARKED"
	| "COMMENT_POSTED"
	| "USER_MENTIONED"
	| "COMMENT_LIKED";

export type TargetType = "POST" | "COMMENT" | "USER";

/* ------------------------------------------------------------------ */
/* recordActivity                                                      */
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
		recipientId?: number; // Add this optional parameter
	}
) {
	// Create the activity
	const activity = await tx.activity.create({
		data: {
			userId: actorId,
			type,
			targetId,
			targetType,
			message,
			postId,
		},
	});

	// Create a direct notification if recipientId is provided
	if (recipientId && recipientId !== actorId) {
		// Don't notify yourself
		await tx.notification.create({
			data: {
				recipientId,
				activityId: activity.id,
			},
		});
	}

	// Process mentions
	if (mentions.length > 0) {
		// Create records for all mentions
		await Promise.all(
			mentions.map((userId) =>
				tx.activityMention.create({
					data: {
						activityId: activity.id,
						userId,
					},
				})
			)
		);
	}

	return activity;
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
	activity: ActivityLog & {
		post?: { title: string };
		mentions?: { user: { name: string } }[];
	}
) {
	const { type, Post, mentions } = activity;
	const mentionedNames = mentions?.map((m) => `@${m.user.name}`) ?? [];
	console.log(activity);
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
