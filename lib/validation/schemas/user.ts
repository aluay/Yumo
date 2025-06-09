import { z } from "zod";
import { jsonContentSchema, urlOrPathSchema } from "./common";
import type { JSONContent } from "@tiptap/react";

/**
 * User and profile validation schemas and types
 * This module contains all user and profile-related validation schemas
 */

// Profile input schema for updating user profiles
export const profileInputSchema = z.object({
	name: z.string().min(2).max(60),
	website: z.string().max(100).optional().nullable(),
	bio: z.string().max(1000).optional().nullable(),
	showEmail: z.boolean().optional(),
	image: urlOrPathSchema,
	pageContent: jsonContentSchema.optional().nullable(),
});

// User schema for basic user information
export const userSchema = z.object({
	id: z.number(),
	name: z.string(),
	email: z.string().email(),
	image: z.string().nullable(),
	showEmail: z.boolean().optional(),
	website: z.string().nullable(),
	bio: z.string().nullable(),
	pageContent: jsonContentSchema.nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

// User profile payload schema for full user profiles
export const userProfilePayloadSchema = userSchema.extend({
	posts: z.array(z.unknown()).optional(), // Will be PostPayload[] in implementation
	comments: z.array(z.unknown()).optional(), // Will be CommentPayload[] in implementation
});

// User patch schema for partial updates
export const userPatchSchema = profileInputSchema.partial();

// Export types
export type ProfileInput = z.infer<typeof profileInputSchema>;
export type User = z.infer<typeof userSchema>;
export type UserProfilePayload = z.infer<typeof userProfilePayloadSchema>;
export type UserPatch = z.infer<typeof userPatchSchema>;

// Interface for full user profile with proper typing
export interface UserProfileInterface {
	id: number;
	name: string;
	email: string;
	image: string | null;
	showEmail?: boolean;
	website: string | null;
	bio: string | null;
	pageContent: JSONContent | null;
	posts: unknown[]; // PostPayload[] - avoiding circular import
	comments: unknown[]; // CommentPayload[] - avoiding circular import
	createdAt: Date;
	updatedAt: Date;
}
