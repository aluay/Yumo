"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeCommentButtonProps {
	commentId: number;
	initialLiked: boolean;
	initialCount: number;
}

export default function LikeCommentButton({
	commentId,
	initialLiked,
	initialCount,
}: LikeCommentButtonProps) {
	const { data: session } = useSession();
	const [liked, setLiked] = useState(initialLiked);
	const [count, setCount] = useState(initialCount);
	const [loading, setLoading] = useState(false);

	const toggleLike = async () => {
		if (!session?.user || loading) return;
		setLoading(true);

		const method = liked ? "DELETE" : "POST";

		const res = await fetch("/api/comment-like", {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ commentId }),
		});

		if (res.ok) {
			setLiked(!liked);
			setCount((c) => c + (liked ? -1 : 1));
		}

		setLoading(false);
	};

	return (
		<Button
			onClick={toggleLike}
			disabled={loading}
			variant="ghost"
			size="sm"
			className="flex items-center gap-1 text-xs text-muted-foreground">
			<Heart
				className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
			/>
			<span>{count}</span>
		</Button>
	);
}
