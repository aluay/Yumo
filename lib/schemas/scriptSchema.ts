import { z } from "zod";

export const scriptSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	language: z.string().min(1, "Language is required"),
	tags: z.array(z.string()).optional(),
});

export type ScriptInput = z.infer<typeof scriptSchema>;
