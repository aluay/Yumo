import { z } from "zod";
import type { JSONContent } from "@tiptap/react";

/**
 * Common validation utilities and reusable schemas
 */

// JSON Content validation for Novel editor
export const jsonContentSchema = z.custom<JSONContent | null>(
	(val) => {
		if (val === null) return true; // allow null
		return typeof val === "object" && (val as JSONContent).type === "doc";
	},
	{ message: "Invalid Novel document" }
);

// Common ID validation
export const positiveIntSchema = z.number().int().positive();

// URL validation that accepts relative paths
export const urlOrPathSchema = z.union([
	z.string().url(),
	z.string().startsWith("/"), // Accept relative paths starting with /
	z.literal(""),
	z.null(),
	z.undefined(),
]);

// Common author schema for references
export const authorSchema = z.object({
	id: z.number(),
	name: z.string(),
	image: z.string().nullable(),
});

// Common timestamps
export const timestampsSchema = z.object({
	createdAt: z.string(), // ISO timestamps – keep as string to avoid TZ drift
	updatedAt: z.string(),
	deletedAt: z.string().nullable().optional(),
});
