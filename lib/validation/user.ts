import { z } from "zod";
import { jsonContentSchema, urlOrPathSchema } from "./common";
import type { JSONContent } from "@tiptap/react";
import type { PostPayload } from "./schemas/post";
import type { CommentPayload } from "./comment";

/**
 * User and profile validation schemas and types
 */

// Profile input schema for update operations
export const profileInputSchema = z.object({
	name: z.string().min(2).max(60),
	website: z.string().max(100).optional().nullable(),
	bio: z.string().max(1000).optional().nullable(),
	showEmail: z.boolean().optional(),
	image: urlOrPathSchema,
	pageContent: jsonContentSchema.optional().nullable(),
});

// User patch schema for general user updates
export const userPatchSchema = z.object({
	name: z.string().min(2).max(60).optional(),
	email: z.string().email().optional(),
	image: urlOrPathSchema.optional(),
});

// Export types
export type ProfileInput = z.infer<typeof profileInputSchema>;
export type UserPatch = z.infer<typeof userPatchSchema>;

// User profile interface
export interface UserProfileInterface {
	id: number;
	name: string;
	email: string;
	image: string | null;
	showEmail?: boolean;
	website: string | null;
	bio: string | null;
	pageContent: JSONContent | null;
	posts: PostPayload[];
	comments: CommentPayload[];
	createdAt: Date;
	updatedAt: Date;
}
