// Estimate reading time for a TipTap/Novel JSONContent object
// Assumes average reading speed of 200 words per minute
import type { JSONContent } from "@tiptap/react";

function extractTextFromJSONContent(node: JSONContent): string {
	if (!node) return "";
	let text = "";
	if (node.type === "text" && typeof node.text === "string") {
		text += node.text;
	}
	if (Array.isArray(node.content)) {
		for (const child of node.content) {
			text += " " + extractTextFromJSONContent(child);
		}
	}
	return text;
}

export function estimateReadingTime(content: JSONContent | null | undefined): {
	minutes: number;
	words: number;
	display: string;
} {
	if (!content) return { minutes: 0, words: 0, display: "0 min read" };
	const text = extractTextFromJSONContent(content);
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / 200));
	return {
		minutes,
		words,
		display: `${minutes} min read`,
	};
}
