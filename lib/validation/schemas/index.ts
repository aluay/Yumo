/**
 * Main validation schemas index
 * This file exports all validation schemas from the modular structure
 * for easy importing across the application
 */

// Common validation utilities
export * from "./common";

// Post-related validation
export * from "./post";

// Comment-related validation
export * from "./comment";

// User and profile validation
export * from "./user";

// Activity validation
export * from "./activity";

// Notification validation
export * from "./notification";

// Legacy exports for backward compatibility
// These re-export schemas with the same names as the original monolithic file
export {
	postInputSchema,
	postPayloadSchema,
	libraryPostPayloadSchema,
} from "./post";

export {
	commentInputSchema,
	commentPayloadSchema,
	likeSchema,
} from "./comment";

export { profileInputSchema } from "./user";

export {
	activityInputSchema as activitySchema,
	activityDeleteSchema as deleteSchema,
} from "./activity";

export { notificationPayloadSchema as notificationSchema } from "./notification";

// Legacy type exports
export type { PostInput, PostPayload, LibraryPostPayload } from "./post";

export type {
	CommentInput,
	CommentPayload as commentPayloadSchemaType,
} from "./comment";

export type {
	ActivityInput as activitySchemaType,
	ActivityDelete as deleteSchemaType,
} from "./activity";

export type { NotificationPayload } from "./notification";
