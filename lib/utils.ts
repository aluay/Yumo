import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CommentNode } from "./schemas/scriptSchema";
import { ActivityLog } from "./schemas/scriptSchema";
import { FileText, Heart, Bookmark, MessageCircle } from "lucide-react";
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

// Build a tree structure from flat comments
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

// Style activity entries based on type
export function getActivityStyle(type: ActivityLog["type"]) {
	switch (type) {
		case "SCRIPT_CREATED":
			return {
				icon: FileText,
				text: "text-green-700 dark:text-green-300",
			};
		case "SCRIPT_LIKED":
			return {
				icon: Heart,
				text: "text-red-700 dark:text-red-300",
			};
		case "SCRIPT_BOOKMARKED":
			return {
				icon: Bookmark,
				text: "text-blue-700 dark:text-blue-300",
			};
		case "COMMENT_POSTED":
			return {
				icon: MessageCircle,
				text: "text-yellow-700 dark:text-yellow-300",
			};
		case "COMMENT_LIKED":
			return {
				icon: Heart,

				text: "text-purple-700 dark:text-purple-300",
			};
		default:
			return { icon: FileText, text: "text-muted-foreground" };
	}
}
