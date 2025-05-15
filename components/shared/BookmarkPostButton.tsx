"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
	postId: number;
	initialBookmarked: boolean;
}

export default function BookmarkPostButton({
	postId,
	initialBookmarked,
}: BookmarkButtonProps) {
	const [bookmarked, setBookmarked] = useState(initialBookmarked);
	const [loading, setLoading] = useState(false);
	const { data: session } = useSession();

	const toggleBookmark = async () => {
		if (!session?.user) return;
		setLoading(true);
		const res = await fetch(`/api/v1/posts/${postId}/bookmark`, {
			method: bookmarked ? "DELETE" : "POST",
		});

		if (res.ok) {
			setBookmarked(!bookmarked);
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
			{bookmarked ? (
				<Bookmark className="h-3.5 w-3.5 fill-amber-500 relative z-10 transition-colors duration-150 ease-in-out" />
			) : (
				<Bookmark className="h-3.5 w-3.5 relative z-10 transition-colors duration-150 ease-in-out group-hover/bookmark-btn:text-amber-500" />
			)}
			<span className="sr-only">
				{bookmarked ? "Remove Bookmark" : "Save Post"}
			</span>
		</Button>
	);
}
