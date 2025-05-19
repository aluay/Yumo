"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface BookmarkButtonProps {
	postId: number;
	initialBookmarked: boolean;
	initialCount: number;
}

export default function BookmarkPostButton({
	postId,
	initialBookmarked,
	initialCount,
}: BookmarkButtonProps) {
	const { data: session } = useSession();
	const [bookmarked, setBookmarked] = useState(initialBookmarked);
	const [count, setCount] = useState(initialCount);
	const [loading, setLoading] = useState(false);
	const [animating, setAnimating] = useState(false);

	const toggleBookmark = async () => {
		if (!session?.user) return;
		if (!bookmarked) {
			setAnimating(true);
			setTimeout(() => setAnimating(false), 600);
		}

		setLoading(true);
		const method = bookmarked ? "DELETE" : "POST";
		const res = await fetch(`/api/v1/posts/${postId}/bookmark`, {
			method,
		});
		if (res.ok) {
			setBookmarked(!bookmarked);
			setCount((c) => c + (bookmarked ? -1 : 1));
			// Clear posts and cursor from session storage but keep sort preference
			sessionStorage.removeItem("paginatedPosts_posts");
			sessionStorage.removeItem("paginatedPosts_cursor");
			
			// Also clear library storage to force refresh of bookmarked posts
			sessionStorage.removeItem("library_posts");
			sessionStorage.removeItem("library_cursor");
		}

		setLoading(false);
	};

	return (
		<Button
			onClick={toggleBookmark}
			disabled={loading || !session?.user}
			variant="ghost"
			size="sm"
			className={cn(
				"flex items-center gap-1 text-muted-foreground relative group/bookmark-btn p-1 h-auto",
				{
					"text-amber-500": bookmarked,
				}
			)}>
			{" "}
			<span
				className={cn(
					"absolute inset-0 bg-amber-500/10 rounded-md opacity-0 transition-opacity duration-150",
					bookmarked ? "opacity-100" : "group-hover/bookmark-btn:opacity-70"
				)}></span>
			<Bookmark
				className={cn(
					"h-3.5 w-3.5 relative z-10 transition-colors duration-150",
					bookmarked && "fill-amber-500",
					animating && "animate-heartbeat",
					!bookmarked && "group-hover/bookmark-btn:text-amber-500"
				)}
			/>{" "}
			<span
				className={cn(
					"text-xs relative z-10 transition-colors duration-150",
					bookmarked && "text-amber-500",
					!bookmarked && "group-hover/bookmark-btn:text-amber-500"
				)}>
				{formatNumber(count)}
			</span>
		</Button>
	);
}
