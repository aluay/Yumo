import { z } from "zod";
import { positiveIntSchema } from "./common";
import { ActivityType } from "@prisma/client";

/**
 * Activity validation schemas and types
 */

// Activity schema for logging user activities
export const activitySchema = z.object({
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
	]),
	targetType: z.enum(["POST", "COMMENT", "USER"]),
	targetId: positiveIntSchema,
	message: z.string().max(300).optional(),
	mentionedUserIds: z.array(positiveIntSchema).optional(),
});

// Delete activity schema
export const deleteSchema = z.object({
	userId: positiveIntSchema,
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
		"USER_FOLLOWED",
	]),
	targetId: positiveIntSchema,
});

// Export types
export type ActivityInput = z.infer<typeof activitySchema>;
export type DeleteActivity = z.infer<typeof deleteSchema>;

// Activity log interface
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
