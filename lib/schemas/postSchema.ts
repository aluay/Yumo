import { z } from "zod";
import type { JSONContent } from "@tiptap/react";
import { ActivityType } from "@prisma/client";

export const postSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	language: z.string().min(1),
	tags: z.array(z.string()).optional(),
	code: z.string().min(1, "Code is required"),
	status: z.enum(["DRAFT", "PUBLISHED"]),
	content: z
		.custom<JSONContent>((val) => {
			if (val === null) return true;
			if (typeof val !== "object") return false;
			return (val as JSONContent).type === "doc";
		})
		.nullable(),
});

export type postSchemaType = z.infer<typeof postSchema>;

// This schema is used to validate posts returned from the API
export const postPayloadSchema = postSchema.extend({
	id: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
	likes: z.number(),
	views: z.number(),
	author: z
		.object({
			id: z.number(),
			name: z.string(),
			image: z.string().nullable().optional(),
		})
		.optional(),
	likedBy: z
		.array(
			z.object({
				id: z.number(),
			})
		)
		.optional(),
	bookmarkedBy: z
		.array(
			z.object({
				id: z.number(),
			})
		)
		.optional(),
	_count: z.object({
		Comment: z.number(),
	}),
});

export type postPayloadSchemaType = z.infer<typeof postPayloadSchema>;

export type postSchemaWithIdType = z.infer<typeof postPayloadSchema>;

export const createCommentSchema = z.object({
	content: z.object({
		type: z.literal("doc"),
		content: z.array(z.any()),
	}),
	postId: z.number(),
	parentId: z.number().optional(),
});

export type createCommentSchemaType = z.infer<typeof createCommentSchema>;

export type CommentNode = {
	id: number;
	content: JSONContent;
	createdAt: Date;
	updatedAt: Date;
	authorId: number;
	postId: number;
	parentId: number | null;
	author: {
		id: number;
		name: string;
		image: string | null;
	};
	likedBy: {
		id: number;
	}[];
	replies: CommentNode[];
};

export const likeSchema = z.object({
	commentId: z.number(),
});

export const activitySchema = z.object({
	userId: z.number(),
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
	]),
	targetId: z.number(),
	message: z.string().optional(),
});

export type activitySchemaType = z.infer<typeof activitySchema>;

export const deleteSchema = z.object({
	userId: z.number(),
	type: z.enum([
		"POST_CREATED",
		"POST_LIKED",
		"POST_BOOKMARKED",
		"COMMENT_POSTED",
		"COMMENT_LIKED",
	]),
	targetId: z.number(),
});

export type deleteSchemaType = z.infer<typeof deleteSchema>;

export type ActivityLog = {
	id: number;
	userId: number;
	type: ActivityType;
	targetId: number;
	message: string | null;
	createdAt: Date;
	post?: {
		id: number;
		title: string;
		language: string;
	};
	mentions?: {
		user: {
			id: number;
			name: string;
			image: string | null;
		};
	}[];
};

export interface UserProfileInterface {
	id: number;
	name: string;
	email: string | null;
	image: string | null;
	createdAt: string;
	postCount: number;
	bookmarkCount: number;
}
