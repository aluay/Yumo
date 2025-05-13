"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import useUserLikedComments from "@/components/shared/useUserLikedComment";
import { Button } from "@/components/ui/button";
import { PostCommentsInterface } from "@/components/shared/CommentItem";

interface CommentThreadProps {
	postId: number;
}

export default function CommentThread({ postId }: CommentThreadProps) {
	const { data: session } = useSession();
	const [comments, setComments] = useState<PostCommentsInterface[]>([]);
	const [nextCursor, setNextCursor] = useState(null);
	const [loading, setLoading] = useState(false);

	const { likedCommentIds, refreshLikedComments } = useUserLikedComments({
		postId,
		userId: Number(session?.user?.id),
	});

	const fetchComments = useCallback(
		async (cursor = null) => {
			setLoading(true);
			const res = await fetch(
				`/api/v1/posts/${postId}/comments?limit=10${
					cursor ? `&cursor=${cursor}` : ""
				}`
			);
			if (!res.ok) {
				console.error("Failed to load comments");
				setLoading(false);
				return;
			}
			const data = await res.json();
			if (cursor) {
				setComments((prev) => [...prev, ...data.data]);
			} else {
				setComments(data.data);
			}
			setNextCursor(data.nextCursor);
			setLoading(false);
		},
		[postId]
	);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	const handleNewComment = () => {
		fetchComments();
	};

	return (
		<div className="space-y-6 mt-8">
			<h2 className="text-lg font-semibold">Comments</h2>

			<CommentForm postId={postId} onSuccess={handleNewComment} />

			{comments.length === 0 && (
				<p className="text-muted-foreground">No comments yet.</p>
			)}

			<div className="space-y-4">
				{comments.map((comment) => (
					<CommentItem
						key={comment.id}
						comment={comment}
						postId={postId}
						onReply={handleNewComment}
						likedCommentIds={likedCommentIds}
						onRefreshLikedComments={refreshLikedComments}
					/>
				))}
			</div>

			{nextCursor && (
				<div className="flex justify-center mt-4">
					<Button
						onClick={() => fetchComments(nextCursor)}
						disabled={loading}
						variant="outline">
						{loading ? "Loading..." : "Load More Comments"}
					</Button>
				</div>
			)}
		</div>
	);
}
