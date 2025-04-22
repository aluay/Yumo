import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CommentNode } from "./schemas/scriptSchema";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Format a number with thousands or millions
export function formatNumber(n: number): string {
	if (n >= 1_000_000)
		return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
	if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
	return n.toString();
}

// Truncate a string to a certain length
export function truncateText(text: string, maxLength = 100): string {
	if (!text) return "";
	return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

export function buildCommentTree(comments: CommentNode[]): CommentNode[] {
	const map = new Map<number, CommentNode>();
	const roots: CommentNode[] = [];

	comments.forEach((c) => {
		map.set(c.id, { ...c, replies: [] });
	});

	map.forEach((comment) => {
		if (comment.parentId) {
			const parent = map.get(comment.parentId);
			if (parent) parent.replies.push(comment);
		} else {
			roots.push(comment);
		}
	});

	return roots;
}
