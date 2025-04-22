import { z } from "zod";
import type { JSONContent } from "@tiptap/react";

export const scriptSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	language: z.string().min(1),
	tags: z.array(z.string()).optional(),
	code: z.string().min(1, "Code is required"),
	content: z
		.custom<JSONContent>((val) => {
			if (val === null) return true;
			if (typeof val !== "object") return false;
			return (val as JSONContent).type === "doc";
		})
		.nullable(),
});

export type scriptSchemaType = z.infer<typeof scriptSchema>;

// This schema is used to validate scripts returned from the API
export const scriptPayloadSchema = scriptSchema.extend({
	id: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
	likes: z.number(),
	views: z.number(),
	author: z
		.object({
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
});

export type scriptPayloadSchemaType = z.infer<typeof scriptPayloadSchema>;

export type scriptSchemaWithIdType = z.infer<typeof scriptPayloadSchema>;

export const createCommentSchema = z.object({
	content: z.string().min(1, "Comment is required"),
	scriptId: z.number(),
	parentId: z.number().optional(),
});

export type createCommentSchemaType = z.infer<typeof createCommentSchema>;

export type CommentNode = {
	id: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	authorId: number;
	scriptId: number;
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
