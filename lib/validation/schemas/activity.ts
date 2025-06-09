import { z } from "zod";

/**
 * Enhanced Activity validation schemas and types
 * This module contains all activity-related validation schemas
 */

// Enhanced activity types enum
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

// Activity input schema for creating activity logs
export const activityInputSchema = z.object({
	type: z.nativeEnum(ActivityType),
	targetType: z.nativeEnum(TargetType),
	targetId: z.number().positive(),
	message: z.string().max(500).optional(),
	metadata: z.record(z.any()).optional(),
	priority: z.nativeEnum(ActivityPriority).default(ActivityPriority.NORMAL),
	mentionedUserIds: z.array(z.number().positive()).optional(),
	recipientIds: z.array(z.number().positive()).optional(),
});

// Activity query schema for fetching activities
export const activityQuerySchema = z.object({
	types: z.array(z.nativeEnum(ActivityType)).optional(),
	targetTypes: z.array(z.nativeEnum(TargetType)).optional(),
	limit: z.number().min(1).max(100).default(20),
	cursor: z.number().positive().optional(),
	includeOwnActions: z.boolean().default(true),
	includeMentions: z.boolean().default(true),
	fromDate: z.string().datetime().optional(),
	toDate: z.string().datetime().optional(),
});

// Activity payload schema for API responses
export const activityPayloadSchema = z.object({
	id: z.number(),
	userId: z.number(),
	type: z.nativeEnum(ActivityType),
	targetType: z.nativeEnum(TargetType),
	targetId: z.number(),
	message: z.string().nullable(),
	metadata: z.record(z.any()).optional(),
	priority: z.nativeEnum(ActivityPriority),
	createdAt: z.string().datetime(),
	user: z
		.object({
			id: z.number(),
			name: z.string(),
			image: z.string().nullable(),
		})
		.optional(),
	post: z
		.object({
			id: z.number(),
			title: z.string(),
			slug: z.string().optional(),
		})
		.optional(),
	mentions: z
		.array(
			z.object({
				id: z.number(),
				name: z.string(),
				image: z.string().nullable(),
			})
		)
		.optional(),
});

// Activity deletion schema
export const activityDeleteSchema = z.object({
	activityId: z.number().positive(),
});

// Bulk activity operations schema
export const bulkActivitySchema = z.object({
	activityIds: z.array(z.number().positive()).min(1).max(50),
	action: z.enum(["delete", "mark_read", "mark_unread"]),
});

// Activity statistics schema
export const activityStatsSchema = z.object({
	userId: z.number().positive(),
	fromDate: z.string().datetime().optional(),
	toDate: z.string().datetime().optional(),
	groupBy: z.enum(["type", "day", "week", "month"]).default("type"),
});

// Export types
export type ActivityInput = z.infer<typeof activityInputSchema>;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;
export type ActivityPayload = z.infer<typeof activityPayloadSchema>;
export type ActivityDelete = z.infer<typeof activityDeleteSchema>;
export type BulkActivityOperation = z.infer<typeof bulkActivitySchema>;
export type ActivityStatsQuery = z.infer<typeof activityStatsSchema>;

// Enhanced interface for activity log with proper typing
export interface ActivityLog {
	id: number;
	userId: number;
	type: ActivityType;
	targetType: TargetType;
	targetId: number;
	message: string | null;
	metadata?: Record<string, unknown>;
	priority: ActivityPriority;
	createdAt: Date;
	postId?: number | null;
	user?: {
		id: number;
		name: string;
		image: string | null;
	};
	Post?: {
		id: number;
		title: string;
		slug?: string;
	};
	mentions?: {
		user: {
			id: number;
			name: string;
			image: string | null;
		};
	}[];
}

// Activity context interface
export interface ActivityContext {
	userId: number;
	timestamp?: Date;
	source?: string;
	userAgent?: string;
	ipAddress?: string;
}

// Notification preferences interface
export interface NotificationPreferences {
	posts: boolean;
	comments: boolean;
	mentions: boolean;
	follows: boolean;
	likes: boolean;
	emailNotifications: boolean;
	pushNotifications: boolean;
}
