import { z } from "zod";
import { positiveIntSchema } from "./common";
import {
	ActivityType,
	TargetType,
	ActivityPriority,
} from "@/lib/services/ActivityService";

/**
 * DEPRECATED: Legacy activity validation schemas
 * Use @/lib/validation/schemas/activity.ts for new implementations
 */

// Activity schema for logging user activities - DEPRECATED
export const activitySchema = z.object({
	type: z.nativeEnum(ActivityType),
	targetType: z.nativeEnum(TargetType),
	targetId: positiveIntSchema,
	message: z.string().max(500).optional(),
	metadata: z.record(z.any()).optional(),
	priority: z.nativeEnum(ActivityPriority).optional(),
	mentionedUserIds: z.array(positiveIntSchema).optional(),
});

// Delete activity schema - DEPRECATED
export const deleteSchema = z.object({
	userId: positiveIntSchema,
	type: z.nativeEnum(ActivityType),
	targetId: positiveIntSchema,
});

// Export types for backward compatibility
export type ActivityInput = z.infer<typeof activitySchema>;
export type DeleteActivity = z.infer<typeof deleteSchema>;

// Re-export enhanced types from ActivityService for backward compatibility
export { ActivityType, TargetType, ActivityPriority };

// Enhanced ActivityLog interface - use schemas/activity.ts for new implementations
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
