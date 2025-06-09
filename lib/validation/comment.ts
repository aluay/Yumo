import { z } from "zod";
import { jsonContentSchema, positiveIntSchema } from "./common";
import type { JSONContent } from "@tiptap/react";

/**
 * Comment validation schemas and types
 */

// Comment input schema for create/update operations
export const commentInputSchema = z.object({
	content: jsonContentSchema,
	postId: positiveIntSchema,
	parentId: positiveIntSchema.optional(),
});

// Forward declare the comment payload type for recursion
type CommentPayloadType = z.infer<typeof commentInputSchema> & {
	id: number;
	authorId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	likeCount: number;
	replyCount: number;
	reportCount: number;
	author: {
		id: number;
		name: string;
		image: string | null;
	};
	post: {
		id: number;
		title: string;
	};
	likes?: { userId: number }[];
	reports?: { userId: number }[];
	replies?: CommentPayloadType[];
};

// Comment payload schema with recursive type handling
export const commentPayloadSchema: z.ZodType<CommentPayloadType> =
	commentInputSchema.extend({
		id: positiveIntSchema,
		authorId: positiveIntSchema,
		createdAt: z.string(),
		updatedAt: z.string(),
		deletedAt: z.string().nullable(),
		likeCount: z.number(),
		replyCount: z.number(),
		reportCount: z.number(),
		author: z.object({
			id: positiveIntSchema,
			name: z.string(),
			image: z.string().nullable(),
		}),
		post: z.object({
			id: positiveIntSchema,
			title: z.string(),
		}),
		likes: z.array(z.object({ userId: positiveIntSchema })).optional(),
		reports: z.array(z.object({ userId: positiveIntSchema })).optional(),
		replies: z.lazy(() => z.array(commentPayloadSchema)).optional(),
	});

// Legacy like schema for comment likes (kept for backward compatibility)
export const likeSchema = z.object({
	commentId: positiveIntSchema,
});

// Comment interaction schemas
export const commentLikeSchema = z.object({
	userId: positiveIntSchema,
	commentId: positiveIntSchema,
});

export const commentReportSchema = z.object({
	userId: positiveIntSchema,
	commentId: positiveIntSchema,
	reason: z.string().max(500),
});

// Patch schema for comment updates
export const commentPatchSchema = commentInputSchema
	.partial()
	.omit({ postId: true });

// Export types
export type CommentInput = z.infer<typeof commentInputSchema>;
export type CommentPayload = z.infer<typeof commentPayloadSchema>;
export type CommentPatch = z.infer<typeof commentPatchSchema>;

// Interface for comment likes
export interface CommentLike {
	userId: number;
	commentId: number;
	createdAt: Date;
	comment: {
		id: number;
		content: JSONContent;
	};
	user: {
		id: number;
		name: string;
		image: string | null;
	};
}
