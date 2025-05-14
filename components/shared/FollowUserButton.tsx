"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { PlusCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowUserButtonProps {
	userId: number;
	initialIsFollowing?: boolean;
}

export default function FollowUserButton({
	userId,
	initialIsFollowing = false,
}: FollowUserButtonProps) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Check follow status on mount if not provided
		if (
			status === "authenticated" &&
			session?.user?.id &&
			initialIsFollowing === undefined
		) {
			fetch(`/api/v1/users/${userId}/followers`)
				.then((res) => res.json())
				.then((data) => {
					type Follower = { id: number };
					setIsFollowing(
						data.followers.some(
							(f: Follower) => f.id === Number(session.user.id)
						)
					);
				});
		}
	}, [userId, session, status, initialIsFollowing]);

	const handleToggleFollow = async () => {
		if (status !== "authenticated") {
			router.push("/api/auth/signin");
			return;
		}
		setIsLoading(true);
		try {
			if (isFollowing) {
				setIsFollowing(false);
				const res = await fetch(`/api/v1/users/${userId}/unfollow`, {
					method: "POST",
				});
				if (!res.ok) setIsFollowing(true);
			} else {
				setIsFollowing(true);
				const res = await fetch(`/api/v1/users/${userId}/follow`, {
					method: "POST",
				});
				if (!res.ok) setIsFollowing(false);
			}
			router.refresh();
		} catch {
			setIsFollowing(!isFollowing);
		} finally {
			setIsLoading(false);
		}
	};

	if (!session?.user || Number(session.user.id) === userId) return null;

	return (
		<Button
			variant={isFollowing ? "secondary" : "default"}
			size="sm"
			onClick={handleToggleFollow}
			disabled={isLoading || status !== "authenticated"}
			className="flex items-center gap-1">
			{isFollowing ? (
				<>
					<CheckCircle className="w-4 h-4 mr-1" /> Following
				</>
			) : (
				<>
					<PlusCircle className="w-4 h-4 mr-1" /> Follow
				</>
			)}
		</Button>
	);
}
