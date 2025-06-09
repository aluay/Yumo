import { z } from "zod";
import { positiveIntSchema } from "./common";
import { activitySchema } from "./activity";

/**
 * Notification validation schemas and types
 */

// Notification schema
export const notificationSchema = z.object({
	id: positiveIntSchema,
	recipientId: positiveIntSchema,
	activityId: positiveIntSchema,
	isRead: z.boolean().default(false),
	createdAt: z.date().or(z.string().datetime()),
	readAt: z.date().or(z.string().datetime()).nullable().optional(),
	// Include the related activity data
	activity: activitySchema,
});

// Export types
export type Notification = z.infer<typeof notificationSchema>;

// Notification payload interface for API responses
export interface NotificationPayload {
	id: number;
	recipientId: number;
	isRead: boolean;
	createdAt: string;
	readAt: string | null;
	activity?: {
		id: number;
		userId: number;
		type: string;
		targetId: number;
		targetType: string;
		message?: string | null;
		createdAt: string;
		title: string;
		description: string;
		user: {
			id: number;
			name: string;
			image?: string;
		};
	};
	relatedContent?: {
		type: string;
		id: number;
		title: string;
	};
	actionText: string;
	actionUrl: string;
	targetContent?: {
		title: string;
		type: string;
		parentType?: string;
	};
}
