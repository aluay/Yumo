"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookmarkButtonProps {
	scriptId: number;
	initialBookmarked: boolean;
}

export default function BookmarkButton({
	scriptId,
	initialBookmarked,
}: BookmarkButtonProps) {
	const [bookmarked, setBookmarked] = useState(initialBookmarked);
	const [loading, setLoading] = useState(false);

	const toggleBookmark = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/bookmark/${scriptId}`, {
				method: bookmarked ? "DELETE" : "POST",
			});

			if (res.ok) {
				setBookmarked(!bookmarked);
			}
		} catch (err) {
			console.error("Failed to toggle bookmark:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			variant="ghost"
			onClick={toggleBookmark}
			disabled={loading}
			size="icon">
			{bookmarked ? (
				<Bookmark className="h-5 w-5 fill-purple-500" />
			) : (
				<Bookmark className="h-5 w-5" />
			)}
			<span className="sr-only">
				{bookmarked ? "Remove Bookmark" : "Save Script"}
			</span>
		</Button>
	);
}
