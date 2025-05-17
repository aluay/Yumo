"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface LikeButtonProps {
	postId: number;
	initialLiked: boolean;
	initialCount: number;
}

export default function LikePostButton({
	postId,
	initialLiked,
	initialCount,
}: LikeButtonProps) {
	const { data: session } = useSession();
	const [liked, setLiked] = useState(initialLiked);
	const [count, setCount] = useState(initialCount);
	const [loading, setLoading] = useState(false);
	const [animating, setAnimating] = useState(false);

	const toggleLike = async () => {
		if (!session?.user) return;
		if (!liked) {
			setAnimating(true);
			setTimeout(() => setAnimating(false), 600);
		}

		setLoading(true);
		const method = liked ? "DELETE" : "POST";
		const res = await fetch(`/api/v1/posts/${postId}/like`, {
			method,
		});

		if (res.ok) {
			setLiked(!liked);
			setCount((c) => c + (liked ? -1 : 1));
			// Clear posts and cursor from session storage but keep sort preference
			sessionStorage.removeItem("paginatedPosts_posts");
			sessionStorage.removeItem("paginatedPosts_cursor");
		}

		setLoading(false);
	};

	return (
		<Button
			onClick={toggleLike}
			disabled={loading || !session?.user}
			variant="ghost"
			size="sm"
			className={cn(
				"flex items-center gap-1 text-muted-foreground relative group/like-btn p-1 h-auto",
				{
					"text-rose-500": liked,
				}
			)}>
			{" "}
			<span
				className={cn(
					"absolute inset-0 bg-rose-500/10 rounded-md opacity-0 transition-opacity duration-150",
					liked ? "opacity-100" : "group-hover/like-btn:opacity-70"
				)}></span>
			<Heart
				className={cn(
					"h-3.5 w-3.5 relative z-10 transition-colors duration-150",
					liked && "fill-rose-500",
					animating && "animate-heartbeat",
					!liked && "group-hover/like-btn:text-rose-500"
				)}
			/>{" "}
			<span
				className={cn(
					"text-xs relative z-10 transition-colors duration-150",
					liked && "text-rose-500",
					!liked && "group-hover/like-btn:text-rose-500"
				)}>
				{formatNumber(count)}
			</span>
		</Button>
	);
}
