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
			className={cn("flex items-center gap-1 text-muted-foreground", {
				"text-yellow-500": bookmarked,
			})}>
			{bookmarked ? (
				<Bookmark className="h-5 w-5 fill-yellow-500" />
			) : (
				<Bookmark className="h-5 w-5" />
			)}
			{/* <span className="sr-only">
				{bookmarked ? "Remove Bookmark" : "Save Post"}
			</span> */}
		</Button>
	);
}
