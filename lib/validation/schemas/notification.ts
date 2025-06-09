import { z } from "zod";
import { activityInputSchema } from "./activity";

/**
 * Notification validation schemas and types
 * This module contains all notification-related validation schemas
 */

// Notification input schema for creating notifications
export const notificationInputSchema = z.object({
	recipientId: z.number(),
	activityId: z.number(),
	isRead: z.boolean().default(false),
});

// Notification payload schema for API responses
export const notificationPayloadSchema = notificationInputSchema.extend({
	id: z.number(),
	createdAt: z.string(),
	readAt: z.string().nullable().optional(),
	activity: activityInputSchema.optional(),
});

// Notification update schema for marking as read
export const notificationUpdateSchema = z.object({
	isRead: z.boolean(),
	readAt: z.string().optional(),
});

// Bulk notification update schema
export const bulkNotificationUpdateSchema = z.object({
	notificationIds: z.array(z.number()),
	isRead: z.boolean(),
});

// Export types
// Export types
export type NotificationInput = z.infer<typeof notificationInputSchema>;
export type NotificationUpdate = z.infer<typeof notificationUpdateSchema>;
export type BulkNotificationUpdate = z.infer<
	typeof bulkNotificationUpdateSchema
>;

// Legacy compatible notification payload interface
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
