import { z } from "zod";

export const ScriptStatusEnum = z.enum(["DRAFT", "PUBLISHED"]);
export const DifficultyLevelEnum = z.enum([
	"BEGINNER",
	"INTERMEDIATE",
	"ADVANCED",
]);

export const scriptSchema = z.object({
	id: z.number().int().positive(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	content: z.record(z.any()),
	language: z.string().min(1, "Language is required"),
	tags: z.array(z.string()),
	difficulty: DifficultyLevelEnum.optional(),
	dependencies: z.array(z.string()).optional(),
	status: ScriptStatusEnum.default("PUBLISHED"),
	likes: z.number().int().default(0),
	views: z.number().int().default(0),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const scriptWithAuthorSchema = scriptSchema.extend({
	author: z
		.object({
			name: z.string(),
			image: z.string().nullable().optional(),
		})
		.nullable(),
});

export type ScriptInput = z.infer<typeof scriptWithAuthorSchema>;
