import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ActivityLog } from "./validation";
import {
	BookMarked,
	MessageCircle,
	BookHeart,
	MessageCircleHeart,
	FilePlus,
	FileText,
} from "lucide-react";
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

// Slugify a string for SEO-friendly URLs
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "") // Remove special chars
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Collapse multiple hyphens
		.replace(/^-+|-+$/g, ""); // Trim hyphens
}

// Style activity entries based on type
export function getActivityStyle(type: ActivityLog["type"]) {
	switch (type) {
		case "POST_CREATED":
			return {
				icon: FilePlus,
				text: "text-green-500",
			};
		case "POST_LIKED":
			return {
				icon: BookHeart,
				text: "text-red-500",
			};
		case "POST_BOOKMARKED":
			return {
				icon: BookMarked,
				text: "text-blue-500",
			};
		case "COMMENT_POSTED":
			return {
				icon: MessageCircle,
				text: "text-yellow-500",
			};
		case "COMMENT_LIKED":
			return {
				icon: MessageCircleHeart,
				text: "text-purple-500",
			};
		default:
			return { icon: FileText, text: "text-muted-foreground" };
	}
}
