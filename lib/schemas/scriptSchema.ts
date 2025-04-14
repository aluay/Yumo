import { z } from "zod";
import type { JSONContent } from "@tiptap/react";

export const scriptSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	language: z.string().min(1),
	tags: z.array(z.string()).optional(),
	content: z
		.custom<JSONContent>((val) => {
			if (val === null) return true;
			if (typeof val !== "object") return false;
			return (val as JSONContent).type === "doc";
		})
		.nullable(),
});

export type scriptSchemaType = z.infer<typeof scriptSchema>;

// This schema is used when to validate scripts returned from the API
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
});

export type scriptPayloadSchemaType = z.infer<typeof scriptPayloadSchema>;

export type scriptSchemaWithIdType = z.infer<typeof scriptPayloadSchema>;
