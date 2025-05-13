"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { followTag, unfollowTag, isUserFollowingTag } from "@/lib/api/api";
import { PlusCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowTagButtonProps {
	tag: string;
	initialIsFollowing?: boolean;
}

export default function FollowTagButton({
	tag,
	initialIsFollowing = false,
}: FollowTagButtonProps) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isLoading, setIsLoading] = useState(false);

	// Check follow status when component loads
	useEffect(() => {
		const checkFollowStatus = async () => {
			if (status === "authenticated" && session?.user?.id) {
				const following = await isUserFollowingTag(
					Number(session.user.id),
					tag
				);
				setIsFollowing(following);
			}
		};

		checkFollowStatus();
	}, [tag, session, status]);

	const handleToggleFollow = async () => {
		if (status !== "authenticated") {
			// Redirect to login if not authenticated
			router.push("/api/auth/signin");
			return;
		}

		setIsLoading(true);
		try {
			if (isFollowing) {
				// Optimistic update
				setIsFollowing(false);
				const success = await unfollowTag(tag);
				if (!success) setIsFollowing(true); // Revert on failure
			} else {
				// Optimistic update
				setIsFollowing(true);
				const success = await followTag(tag);
				if (!success) setIsFollowing(false); // Revert on failure
			}
			// Refresh the page data
			router.refresh();
		} catch (error) {
			console.error("Error toggling tag follow:", error);
			// Revert optimistic update on error
			setIsFollowing(!isFollowing);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={isFollowing ? "secondary" : "default"}
			size="sm"
			onClick={handleToggleFollow}
			disabled={isLoading || status === "loading"}
			className="flex items-center gap-1">
			{isFollowing ? (
				<>
					<CheckCircle className="w-4 h-4 mr-1" />
					Following
				</>
			) : (
				<>
					<PlusCircle className="w-4 h-4 mr-1" />
					Follow
				</>
			)}
		</Button>
	);
}
