"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

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

	const toggleLike = async () => {
		if (!session?.user) return;

		setLoading(true);
		const method = liked ? "DELETE" : "POST";
		const res = await fetch("/api/post-like", {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ postId }),
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
			disabled={loading || !session?.user}
			variant="ghost"
			size="sm"
			className={cn("flex items-center gap-1 text-muted-foreground", {
				"text-red-500": liked,
			})}>
			{liked ? (
				<Heart className="h-4 w-4 fill-red-500" />
			) : (
				<Heart className="h-4 w-4" />
			)}
			<span>{count}</span>
		</Button>
	);
}
