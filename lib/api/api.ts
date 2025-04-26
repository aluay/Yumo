import prisma from "@/lib/prisma";
import { type scriptPayloadSchemaType } from "@/lib/schemas/scriptSchema";
import type { JSONContent } from "@tiptap/react";

// Get scripts from API and return them as JSON
export const getScripts = async (): Promise<scriptPayloadSchemaType[]> => {
	try {
		const res = await fetch("/api/scripts");
		if (!res.ok) throw new Error("Failed to fetch scripts");
		const data = await res.json();
		return data;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error("An unexpected error occurred");
		}
		return [];
	}
};

// Get all scripts that belong to the currently authenticated user
export const getUserScripts = async (userId: number) => {
	try {
		const res = await fetch(`/api/scripts/user/${userId}`);
		if (!res.ok) throw new Error("Failed to fetch scripts");
		const data = await res.json();
		return data;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error("An unexpected error occurred");
		}
		return [];
	}
};

// Get a single script by id
export async function getScriptById(scriptId: number, userId?: number) {
	const script = await prisma.script.findUnique({
		where: {
			id: scriptId,
			...(userId && { authorId: userId }),
		},
		include: {
			author: {
				select: { name: true, image: true },
			},
			likedBy: {
				select: { id: true },
			},
			bookmarkedBy: {
				select: { id: true },
			},
		},
	});

	if (!script) return null;

	return {
		...script,
		createdAt: script.createdAt.toISOString(),
		updatedAt: script.updatedAt.toISOString(),
		description: script.description ?? undefined,
		tags: script.tags ?? [],
		content:
			script.content &&
			typeof script.content === "object" &&
			"type" in script.content
				? (script.content as JSONContent)
				: { type: "doc", content: [] },
		author: script.author ?? undefined,
	};
}
