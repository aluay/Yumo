import { prisma } from "./db";
import { JSONContent } from "@tiptap/react";
import { ActivityLog } from "./validation/post";

const BASE_URL =
	typeof window === "undefined"
		? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		: "";

import { Prisma, PrismaClient } from "@prisma/client";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type ActivityType =
	| "POST_CREATED"
	| "POST_LIKED"
	| "POST_BOOKMARKED"
	| "COMMENT_POSTED"
	| "COMMENT_LIKED";

export type TargetType = "POST" | "COMMENT" | "USER";

interface RecordActivityOptions {
	actorId: number; // user who caused the event
	type: ActivityType;
	targetType: TargetType;
	targetId: number;
	postId?: number;
	message?: string; // optional free-text
	mentions?: number[]; // userIds referenced via @mentions
}

/* ------------------------------------------------------------------ */
/* Helper to look up the owner of the target (post author, etc.)       */
/* ------------------------------------------------------------------ */
async function lookupOwner(
	tx: Prisma.TransactionClient,
	targetType: TargetType,
	targetId: number
): Promise<number | null> {
	switch (targetType) {
		case "POST":
			return tx.post
				.findUnique({ where: { id: targetId }, select: { authorId: true } })
				.then((p) => p?.authorId ?? null);
		case "COMMENT":
			return tx.comment
				.findUnique({ where: { id: targetId }, select: { authorId: true } })
				.then((c) => c?.authorId ?? null);
		case "USER":
			return targetId; // the user themselves
		default:
			return null;
	}
}

/* ------------------------------------------------------------------ */
/* recordActivity                                                      */
/* ------------------------------------------------------------------ */
export async function recordActivity(
	tx: Prisma.TransactionClient | PrismaClient,
	opts: RecordActivityOptions
) {
	const {
		actorId,
		type,
		targetType,
		postId,
		targetId,
		message,
		mentions = [],
	} = opts;

	/* 1 ── create Activity row ───────────────────────────────────── */
	const activity = await tx.activity.create({
		data: {
			userId: actorId,
			type,
			targetType,
			targetId,
			message,
			postId,
		},
	});

	/* 2 ── create mentions (if any) ──────────────────────────────── */
	if (mentions.length) {
		await tx.activityMention.createMany({
			data: mentions.map((u) => ({
				userId: u,
				activityId: activity.id,
			})),
			skipDuplicates: true,
		});
	}

	/* 3 ── determine notification recipients ────────────────────── */
	const recipients = new Set<number>();

	// 3a. owner of the target (post / comment / user)
	const ownerId = await lookupOwner(tx, targetType, targetId);
	if (ownerId && ownerId !== actorId) recipients.add(ownerId);

	// 3b. all @mentioned users
	mentions.forEach((u) => {
		if (u !== actorId) recipients.add(u);
	});

	/* 4 ── create Notification rows (skip self, skip duplicates) ── */
	if (recipients.size) {
		await tx.notification.createMany({
			data: Array.from(recipients).map((rId) => ({
				recipientId: rId,
				activityId: activity.id,
			})),
			skipDuplicates: true,
		});
	}

	return activity; // return for logging / debugging if needed
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
