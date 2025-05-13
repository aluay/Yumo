import { useCallback, useEffect, useState } from "react";

interface useUserLikedCommentsProps {
	postId: number;
	userId: number;
}

export default function useUserLikedComments({
	postId,
	userId,
}: useUserLikedCommentsProps) {
	const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(
		new Set()
	);
	const [loadingLikes, setLoadingLikes] = useState(false);

	const fetchLikedComments = useCallback(async () => {
		setLoadingLikes(true);
		const res = await fetch(
			`/api/v1/users/${userId}/likes/comments/by-post?postId=${postId}`
		);
		if (!res.ok) {
			console.error("Failed to load liked comments");
			setLoadingLikes(false);
			return;
		}
		const data = await res.json();

		// We store in a Set for O(1) lookup
		setLikedCommentIds(new Set(data.data));
		setLoadingLikes(false);
	}, [postId, userId]);

	useEffect(() => {
		if (userId) {
			fetchLikedComments();
		}
	}, [fetchLikedComments, userId]);

	return {
		likedCommentIds,
		loadingLikes,
		refreshLikedComments: fetchLikedComments,
	};
}
