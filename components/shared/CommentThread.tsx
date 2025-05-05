"use client";

import { useEffect, useState, useCallback } from "react";
import CommentForm from "./CommentForm";
import moment from "moment";
import DeleteCommentButton from "./DeleteCommentButton";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import LikeCommentButton from "./LikeCommentButton";
import { useSession } from "next-auth/react";
import type { JSONContent } from "@tiptap/react";
import RichContentViewer from "@/components/shared/RichContentViewer";

interface Comment {
	id: number;
	content: JSONContent;
	createdAt: string;
	author: {
		id: number;
		name: string;
		image?: string | null;
	};
	likedBy: { id: number }[];
	replies: Comment[];
}

function CommentItem({
	comment,
	postId,
	onReply,
}: {
	comment: Comment;
	postId: number;
	onReply: () => void;
}) {
	const [replying, setReplying] = useState(false);
	const { data: session } = useSession();

	const userHasLiked =
		comment.likedBy?.some((user) => user.id === Number(session?.user?.id)) ??
		false;

	return (
		<div className="pl-4 border-l">
			<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
				<span className="font-medium">{comment.author.name}</span>
				<span>·</span>
				<span>{moment(comment.createdAt).fromNow()}</span>
			</div>

			{comment.content && (
				<div>
					<RichContentViewer content={comment.content as JSONContent} />
				</div>
			)}
			<div className="flex gap-2 items-center text-sm text-muted-foreground">
				<LikeCommentButton
					commentId={comment.id}
					initialLiked={userHasLiked}
					initialCount={comment.likedBy.length}
				/>
				<Button
					size="icon"
					variant="ghost"
					onClick={() => setReplying((r) => !r)}
					className="hover:underline text-xs">
					<MessageCircle />
				</Button>
				<DeleteCommentButton
					commentId={comment.id}
					authorId={comment.author.id}
					onSuccess={onReply}
				/>
			</div>

			{replying && (
				<div className="mt-2">
					<CommentForm
						postId={postId}
						parentId={comment.id}
						onSuccess={() => {
							setReplying(false);
							onReply();
						}}
					/>
				</div>
			)}

			{/* Render replies recursively */}
			<div className="mt-3 space-y-2">
				{comment.replies.map((reply) => (
					<CommentItem
						key={reply.id}
						comment={reply}
						postId={postId}
						onReply={onReply}
					/>
				))}
			</div>
		</div>
	);
}

export default function CommentThread({ postId }: { postId: number }) {
	const [comments, setComments] = useState<Comment[]>([]);

	const fetchComments = useCallback(async () => {
		const res = await fetch(`/api/comment/${postId}`);
		if (!res.ok) return;
		const data = await res.json();
		setComments(data);
	}, [postId]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	return (
		<div className="space-y-6 mt-8">
			<h2 className="text-lg font-semibold">{comments.length}&nbsp;Comments</h2>

			{comments.length === 0 && (
				<p className="text-muted-foreground">No comments yet.</p>
			)}

			<div className="space-y-4">
				{comments.map((comment) => (
					<CommentItem
						key={comment.id}
						comment={comment}
						postId={postId}
						onReply={fetchComments}
					/>
				))}
			</div>
			<CommentForm postId={postId} onSuccess={fetchComments} />
		</div>
	);
}
