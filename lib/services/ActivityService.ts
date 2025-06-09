import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

/* ------------------------------------------------------------------ */
/* TYPES AND ENUMS                                                    */
/* ------------------------------------------------------------------ */

export enum ActivityType {
	// Post Activities
	POST_CREATED = "POST_CREATED",
	POST_LIKED = "POST_LIKED",
	POST_UNLIKED = "POST_UNLIKED",
	POST_BOOKMARKED = "POST_BOOKMARKED",
	POST_UNBOOKMARKED = "POST_UNBOOKMARKED",
	POST_VIEWED = "POST_VIEWED",
	POST_SHARED = "POST_SHARED",

	// Comment Activities
	COMMENT_POSTED = "COMMENT_POSTED",
	COMMENT_LIKED = "COMMENT_LIKED",
	COMMENT_UNLIKED = "COMMENT_UNLIKED",
	COMMENT_REPLIED = "COMMENT_REPLIED",

	// User Activities
	USER_FOLLOWED = "USER_FOLLOWED",
	USER_UNFOLLOWED = "USER_UNFOLLOWED",
	USER_MENTIONED = "USER_MENTIONED",
	USER_PROFILE_UPDATED = "USER_PROFILE_UPDATED",

	// Tag Activities
	TAG_FOLLOWED = "TAG_FOLLOWED",
	TAG_UNFOLLOWED = "TAG_UNFOLLOWED",

	// System Activities
	ACCOUNT_CREATED = "ACCOUNT_CREATED",
	LOGIN = "LOGIN",
}

export enum TargetType {
	POST = "POST",
	COMMENT = "COMMENT",
	USER = "USER",
	TAG = "TAG",
}

export enum ActivityPriority {
	LOW = "LOW",
	NORMAL = "NORMAL",
	HIGH = "HIGH",
	URGENT = "URGENT",
}

export interface ActivityInput {
	type: ActivityType;
	targetType: TargetType;
	targetId: number;
	message?: string;
	metadata?: Record<string, unknown> | null;
	priority?: ActivityPriority;
	mentionedUserIds?: number[];
	recipientIds?: number[];
}

export interface ActivityContext {
	userId: number;
	timestamp?: Date;
	source?: string;
	userAgent?: string;
	ipAddress?: string;
}

/* ------------------------------------------------------------------ */
/* ACTIVITY SERVICE CLASS                                             */
/* ------------------------------------------------------------------ */

export class ActivityService {
	private static instance: ActivityService;

	public static getInstance(): ActivityService {
		if (!ActivityService.instance) {
			ActivityService.instance = new ActivityService();
		}
		return ActivityService.instance;
	}

	/* ------------------------------------------------------------------ */
	/* CORE ACTIVITY OPERATIONS                                           */
	/* ------------------------------------------------------------------ */

	/**
	 * Create a new activity with all related data (mentions, notifications)
	 */ async createActivity(
		context: ActivityContext,
		input: ActivityInput,
		tx?: Prisma.TransactionClient
	) {
		try {
			// If we already have a transaction, use it directly
			if (tx) {
				return await this.createActivityWithinTransaction(tx, context, input);
			}

			// Otherwise, create a new transaction
			return await prisma.$transaction(async (transaction) => {
				return await this.createActivityWithinTransaction(
					transaction,
					context,
					input
				);
			});
		} catch (error) {
			console.error("Failed to create activity:", error);
			throw new Error("Activity creation failed");
		}
	}

	/**
	 * Create activity within an existing transaction
	 */
	private async createActivityWithinTransaction(
		tx: Prisma.TransactionClient,
		context: ActivityContext,
		input: ActivityInput
	) {
		// 1. Create the main activity record
		const activity = await this.createActivityRecord(tx, context, input);

		// 2. Process mentions if any
		if (input.mentionedUserIds?.length) {
			await this.createMentions(tx, activity.id, input.mentionedUserIds);
		}

		// 3. Determine notification recipients
		const recipients = await this.determineNotificationRecipients(
			tx,
			context,
			input
		);

		// 4. Create notifications for recipients
		if (recipients.length > 0) {
			await this.createNotifications(
				tx,
				activity.id,
				recipients,
				input.priority || ActivityPriority.NORMAL
			);
		}

		// 5. Update related counters/statistics
		await this.updateStatistics(tx, input);

		return activity;
	}

	/**
	 * Create the core activity record
	 */
	private async createActivityRecord(
		tx: Prisma.TransactionClient,
		context: ActivityContext,
		input: ActivityInput
	) {
		// Resolve postId if needed
		const postId = await this.resolvePostId(tx, input);

		return await tx.activity.create({
			data: {
				userId: context.userId,
				type: input.type,
				targetType: input.targetType,
				targetId: input.targetId,
				message: input.message,
				postId,
				metadata: (input.metadata as Prisma.InputJsonValue) || Prisma.JsonNull,
				createdAt: context.timestamp || new Date(),
			},
		});
	}

	/**
	 * Resolve the postId based on target type and ID
	 */
	private async resolvePostId(
		tx: Prisma.TransactionClient,
		input: ActivityInput
	): Promise<number | null> {
		switch (input.targetType) {
			case TargetType.POST:
				return input.targetId;

			case TargetType.COMMENT:
				const comment = await tx.comment.findUnique({
					where: { id: input.targetId },
					select: { postId: true },
				});
				return comment?.postId || null;

			default:
				return null;
		}
	}

	/**
	 * Create mention records for mentioned users
	 */
	private async createMentions(
		tx: Prisma.TransactionClient,
		activityId: number,
		mentionedUserIds: number[]
	) {
		const uniqueUserIds = [...new Set(mentionedUserIds)];

		await tx.activityMention.createMany({
			data: uniqueUserIds.map((userId) => ({
				activityId,
				userId,
			})),
			skipDuplicates: true,
		});
	}

	/**
	 * Determine who should receive notifications for this activity
	 */
	private async determineNotificationRecipients(
		tx: Prisma.TransactionClient,
		context: ActivityContext,
		input: ActivityInput
	): Promise<number[]> {
		const recipients = new Set<number>();

		// 1. Add explicit recipients
		if (input.recipientIds?.length) {
			input.recipientIds.forEach((id) => recipients.add(id));
		}

		// 2. Add mentioned users
		if (input.mentionedUserIds?.length) {
			input.mentionedUserIds.forEach((id) => recipients.add(id));
		}

		// 3. Add target owner (post author, comment author, etc.)
		const ownerId = await this.getTargetOwner(tx, input);
		if (ownerId && ownerId !== context.userId) {
			recipients.add(ownerId);
		}

		// 4. Add followers for certain activity types
		if (this.shouldNotifyFollowers(input.type)) {
			const followers = await this.getUserFollowers(tx, context.userId);
			followers.forEach((id) => recipients.add(id));
		}

		// Remove the actor (don't notify yourself)
		recipients.delete(context.userId);

		return Array.from(recipients);
	}

	/**
	 * Get the owner of a target (post author, comment author, etc.)
	 */
	private async getTargetOwner(
		tx: Prisma.TransactionClient,
		input: ActivityInput
	): Promise<number | null> {
		switch (input.targetType) {
			case TargetType.POST:
				const post = await tx.post.findUnique({
					where: { id: input.targetId },
					select: { authorId: true },
				});
				return post?.authorId || null;

			case TargetType.COMMENT:
				const comment = await tx.comment.findUnique({
					where: { id: input.targetId },
					select: { authorId: true },
				});
				return comment?.authorId || null;

			case TargetType.USER:
				return input.targetId;

			default:
				return null;
		}
	}

	/**
	 * Check if followers should be notified for this activity type
	 */
	private shouldNotifyFollowers(type: ActivityType): boolean {
		return [ActivityType.POST_CREATED, ActivityType.POST_SHARED].includes(type);
	}

	/**
	 * Get followers of a user
	 */
	private async getUserFollowers(
		tx: Prisma.TransactionClient,
		userId: number
	): Promise<number[]> {
		const follows = await tx.userFollow.findMany({
			where: { followingId: userId },
			select: { followerId: true },
		});

		return follows.map((f) => f.followerId);
	}

	/**
	 * Create notification records for recipients
	 */
	private async createNotifications(
		tx: Prisma.TransactionClient,
		activityId: number,
		recipientIds: number[],
		priority: ActivityPriority
	) {
		await tx.notification.createMany({
			data: recipientIds.map((recipientId) => ({
				recipientId,
				activityId,
				priority,
			})),
			skipDuplicates: true,
		});
	}

	/**
	 * Update related statistics and counters
	 */ private async updateStatistics(
		tx: Prisma.TransactionClient,
		input: ActivityInput
	) {
		switch (input.type) {
			case ActivityType.TAG_FOLLOWED:
				// TODO: Add followCount field to Tag model
				// await tx.tag.update({
				// 	where: { name: String(input.targetId) },
				// 	data: { followCount: { increment: 1 } },
				// });
				break;

			case ActivityType.TAG_UNFOLLOWED:
				// TODO: Add followCount field to Tag model
				// await tx.tag.update({
				// 	where: { name: String(input.targetId) },
				// 	data: { followCount: { decrement: 1 } },
				// });
				break;

			// Add more statistics updates as needed
		}
	}

	/* ------------------------------------------------------------------ */
	/* ACTIVITY RETRIEVAL                                                 */
	/* ------------------------------------------------------------------ */

	/**
	 * Get user activities with enhanced filtering and pagination
	 */
	async getUserActivities(
		userId: number,
		options: {
			types?: ActivityType[];
			limit?: number;
			cursor?: number;
			includeOwnActions?: boolean;
			includeMentions?: boolean;
		} = {}
	) {
		const {
			types,
			limit = 20,
			cursor,
			includeOwnActions = true,
			includeMentions = true,
		} = options;
		// Build user filter conditions
		const userConditions: Prisma.ActivityWhereInput[] = [];

		if (includeOwnActions) {
			userConditions.push({ userId });
		}

		if (includeMentions) {
			userConditions.push({ mentions: { some: { userId } } });
		}

		const whereClause: Prisma.ActivityWhereInput = {
			AND: [
				// Type filter
				...(types ? [{ type: { in: types } }] : []),
				// Cursor pagination
				...(cursor ? [{ id: { lt: cursor } }] : []),
				// User filter - only add if we have conditions
				...(userConditions.length > 0 ? [{ OR: userConditions }] : []),
			],
		};

		const activities = await prisma.activity.findMany({
			where: whereClause,
			orderBy: { id: "desc" },
			take: limit + 1, // Get one extra for pagination
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				Post: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
				mentions: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		});

		const hasMore = activities.length > limit;
		if (hasMore) activities.pop(); // Remove the extra item

		return {
			activities,
			hasMore,
			nextCursor: hasMore ? activities[activities.length - 1]?.id : null,
		};
	}

	/* ------------------------------------------------------------------ */
	/* ACTIVITY DELETION AND CLEANUP                                      */
	/* ------------------------------------------------------------------ */

	/**
	 * Delete an activity and all related data
	 */
	async deleteActivity(
		userId: number,
		activityId: number,
		options: { force?: boolean } = {}
	) {
		return await prisma.$transaction(async (tx) => {
			// Verify ownership or admin privileges
			const activity = await tx.activity.findUnique({
				where: { id: activityId },
				select: { userId: true },
			});

			if (!activity) {
				throw new Error("Activity not found");
			}

			if (activity.userId !== userId && !options.force) {
				throw new Error("Unauthorized to delete this activity");
			}

			// Delete related data (will cascade due to DB constraints)
			await tx.activity.delete({
				where: { id: activityId },
			});

			return { success: true };
		});
	}

	/**
	 * Bulk delete activities by criteria
	 */
	async bulkDeleteActivities(criteria: {
		userId?: number;
		types?: ActivityType[];
		olderThan?: Date;
	}) {
		const whereClause: Prisma.ActivityWhereInput = {
			...(criteria.userId && { userId: criteria.userId }),
			...(criteria.types && { type: { in: criteria.types } }),
			...(criteria.olderThan && { createdAt: { lt: criteria.olderThan } }),
		};

		const deleteResult = await prisma.activity.deleteMany({
			where: whereClause,
		});

		return { deletedCount: deleteResult.count };
	}

	/* ------------------------------------------------------------------ */
	/* UTILITY METHODS                                                    */
	/* ------------------------------------------------------------------ */

	/**
	 * Extract mentioned user IDs from TipTap content
	 */
	extractMentionedUserIds(content: JSONContent): number[] {
		const mentionedIds = new Set<number>();

		function walk(node: JSONContent) {
			if (node.type === "mention" && node.attrs?.id) {
				const idNum = Number(node.attrs.id);
				if (!isNaN(idNum)) {
					mentionedIds.add(idNum);
				}
			}

			if (node.content && Array.isArray(node.content)) {
				for (const child of node.content) {
					walk(child);
				}
			}
		}

		walk(content);
		return Array.from(mentionedIds);
	}

	/**
	 * Generate human-readable activity messages
	 */ generateActivityMessage(
		activity: {
			type: ActivityType;
			message?: string | null;
			user?: { name?: string };
			Post?: { title?: string };
			mentions?: { user: { name: string } }[];
		},
		options: { includeUserName?: boolean } = {}
	): string {
		const { type, user, Post, mentions } = activity;
		const userName = options.includeUserName ? user?.name || "Someone" : "You";
		const mentionedNames = mentions?.map((m) => `@${m.user.name}`) || [];

		switch (type) {
			case ActivityType.POST_CREATED:
				return `${userName} published "${Post?.title || "a post"}"`;

			case ActivityType.POST_LIKED:
				return `${userName} liked "${Post?.title || "a post"}"`;

			case ActivityType.POST_BOOKMARKED:
				return `${userName} bookmarked "${Post?.title || "a post"}"`;

			case ActivityType.COMMENT_POSTED:
				if (mentionedNames.length > 0) {
					return `${userName} commented on "${
						Post?.title
					}" and mentioned ${mentionedNames.join(", ")}`;
				}
				return `${userName} commented on "${Post?.title || "a post"}"`;

			case ActivityType.COMMENT_LIKED:
				return `${userName} liked a comment on "${Post?.title || "a post"}"`;

			case ActivityType.USER_FOLLOWED:
				return `${userName} ${
					options.includeUserName ? "started following you" : "followed a user"
				}`;

			case ActivityType.USER_MENTIONED:
				return `${userName} mentioned you`;

			case ActivityType.TAG_FOLLOWED:
				return `${userName} followed a tag`;

			default:
				return activity.message || `${userName} performed an action`;
		}
	}

	/**
	 * Get activity statistics for a user
	 */
	async getActivityStats(userId: number, timeRange?: { from: Date; to: Date }) {
		const whereClause: Prisma.ActivityWhereInput = {
			userId,
			...(timeRange && {
				createdAt: {
					gte: timeRange.from,
					lte: timeRange.to,
				},
			}),
		};

		const stats = await prisma.activity.groupBy({
			by: ["type"],
			where: whereClause,
			_count: { type: true },
		});

		return stats.reduce((acc, stat) => {
			acc[stat.type] = stat._count.type;
			return acc;
		}, {} as Record<string, number>);
	}
}

/* ------------------------------------------------------------------ */
/* CONVENIENCE FUNCTIONS                                              */
/* ------------------------------------------------------------------ */

// Export a singleton instance for easy usage
export const activityService = ActivityService.getInstance();

// Convenience function for simple activity creation
export async function logActivity(
	userId: number,
	input: ActivityInput,
	tx?: Prisma.TransactionClient
) {
	return activityService.createActivity({ userId }, input, tx);
}

// Convenience function for activity deletion
export async function deleteActivity(
	userId: number,
	type: ActivityType,
	targetId: number
) {
	const activities = await prisma.activity.findMany({
		where: { userId, type, targetId },
		select: { id: true },
	});

	for (const activity of activities) {
		await activityService.deleteActivity(userId, activity.id);
	}
}
