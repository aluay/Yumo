import { z } from "zod";
import { jsonContentSchema, authorSchema } from "./common";

/**
 * Post validation schemas and types
 * This module contains all post-related validation schemas
 */

// Post input schema for create/update operations
export const postInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string(),
	content: jsonContentSchema,
	tags: z.array(z.string()).max(5, "You can add up to 5 tags only"),
	status: z.enum(["DRAFT", "PUBLISHED"]),
	category: z.enum(["TUTORIAL", "DISCUSSION", "SHOWCASE", "EXPERIENCE"]),
});

// Post payload schema - what the API returns to the client
export const postPayloadSchema = postInputSchema
	.extend({
		id: z.number(),
		createdAt: z.string(),
		updatedAt: z.string(),
		likes: z.array(z.object({ userId: z.number() })),
		likeCount: z.number(),
		bookmarks: z.array(z.object({ userId: z.number() })),
		bookmarkCount: z.number(),
		commentCount: z.number().optional().default(0),
		author: authorSchema,
		slug: z.string(),
	})
	.partial({
		category: true,
	});

// Minimal library post payload for bookmarked posts
export const libraryPostPayloadSchema = z.object({
	id: z.number(),
	title: z.string(),
	tags: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
	author: authorSchema,
	slug: z.string(),
});

// Post interaction schemas
export const postLikeSchema = z.object({
	userId: z.number(),
	postId: z.number(),
});

export const postBookmarkSchema = z.object({
	userId: z.number(),
	postId: z.number(),
});

// Patch schema for post updates
export const postPatchSchema = postInputSchema.partial();

// Export types
export type PostInput = z.infer<typeof postInputSchema>;
export type PostPayload = z.infer<typeof postPayloadSchema>;
export type LibraryPostPayload = z.infer<typeof libraryPostPayloadSchema>;
export type PostPatch = z.infer<typeof postPatchSchema>;

// Interfaces for complex post-related types
export interface PostLike {
	userId: number;
	postId: number;
	createdAt: Date;
	post: {
		id: number;
		title: string;
	};
	user: {
		id: number;
		name: string;
		image: string | null;
	};
}

export interface PostBookmark {
	userId: number;
	postId: number;
	createdAt: Date;
	post: {
		id: number;
		title: string;
	};
	user: {
		id: number;
		name: string;
		image: string | null;
	};
}
