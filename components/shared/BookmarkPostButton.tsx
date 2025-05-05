"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

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
		setLoading(true);
		try {
			const res = await fetch(`/api/bookmark/${postId}`, {
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
			disabled={loading || !session?.user}
			size="icon">
			{bookmarked ? (
				<Bookmark className="h-5 w-5 fill-purple-500" />
			) : (
				<Bookmark className="h-5 w-5" />
			)}
			<span className="sr-only">
				{bookmarked ? "Remove Bookmark" : "Save Post"}
			</span>
		</Button>
	);
}
