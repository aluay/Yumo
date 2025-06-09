import { z } from "zod";
import { ActivityType } from "@prisma/client";

/**
 * Activity validation schemas and types
 * This module contains all activity-related validation schemas
 */

// Activity input schema for creating activity logs
export const activityInputSchema = z.object({
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
		"USER_FOLLOWED",
	]),
	targetType: z.enum(["POST", "COMMENT", "USER"]),
	targetId: z.number(),
	message: z.string().max(300).optional(),
	mentionedUserIds: z.array(z.number()).optional(),
});

// Activity payload schema for API responses
export const activityPayloadSchema = activityInputSchema.extend({
	id: z.number(),
	userId: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
	Post: z
		.object({
			id: z.number(),
			title: z.string(),
		})
		.optional(),
	mentions: z
		.array(
			z.object({
				user: z.object({
					id: z.number(),
					name: z.string(),
					image: z.string().nullable(),
				}),
			})
		)
		.optional(),
});

// Activity deletion schema
export const activityDeleteSchema = z.object({
	userId: z.number(),
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
		"USER_FOLLOWED",
	]),
	targetId: z.number(),
});

// Export types
export type ActivityInput = z.infer<typeof activityInputSchema>;
export type ActivityPayload = z.infer<typeof activityPayloadSchema>;
export type ActivityDelete = z.infer<typeof activityDeleteSchema>;

// Interface for activity log with proper typing
export interface ActivityLog {
	id: number;
	userId: number;
	type: ActivityType;
	targetId: number;
	message: string | null;
	createdAt: Date;
	Post?: {
		id: number;
		title: string;
	};
	mentions?: {
		user: {
			id: number;
			name: string;
			image: string | null;
		};
	}[];
}
