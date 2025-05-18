"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart, Trash } from "lucide-react";
import CommentForm from "./CommentForm";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import RichContentViewer from "@/components/shared/RichContentViewer";
import { cn } from "@/lib/utils";
import { JSONContent } from "novel";

export interface PostCommentsInterface {
	id: number;
	content: JSONContent;
	createdAt: string;
	likeCount: number;
	replyCount: number;
	author: {
		id: number;
		name: string;
		image?: string | null;
	};
	post: {
		id: number;
		title: string;
	};
	replies?: PostCommentsInterface[];
}

interface CommentItemProps {
	comment: PostCommentsInterface;
	postId: number;
	onReply: () => void;
	onRefreshLikedComments: () => void;
	likedCommentIds: Set<number>;
}

export default function CommentItem({
	comment,
	postId,
	onReply,
	onRefreshLikedComments,
	likedCommentIds,
}: CommentItemProps) {
	const [replying, setReplying] = useState(false);
	const { data: session } = useSession();
	const [isLiked, setIsLiked] = useState(likedCommentIds.has(comment.id));
	const [likeCount, setLikeCount] = useState(comment.likeCount);
	const [loadingLike, setLoadingLike] = useState(false);
	const isAuthor = session?.user?.id === comment.author.id;

	useEffect(() => {
		setIsLiked(likedCommentIds.has(comment.id));
	}, [likedCommentIds, comment.id]);

	const handleLikeToggle = async () => {
		if (!session?.user) return;
		setLoadingLike(true);

		const res = await fetch(`/api/v1/comments/${comment.id}/like`, {
			method: isLiked ? "DELETE" : "POST",
		});

		if (res.ok) {
			if (isLiked) {
				likedCommentIds.delete(comment.id);
				setLikeCount((c) => c - 1);
			} else {
				likedCommentIds.add(comment.id);
				setLikeCount((c) => c + 1);
			}
			setIsLiked(!isLiked);
			onRefreshLikedComments(); // keep server and client in sync
		}
		setLoadingLike(false);
	};

	const handleDelete = async () => {
		const res = await fetch(`/api/v1/comments/${comment.id}`, {
			method: "DELETE",
		});
		if (res.ok) {
			onReply(); // refresh comments after delete
		}
	};

	return (
		<div className="pl-4 border-l">
			<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
				<span className="font-medium">{comment.author.name}</span>
				<span>·</span>
				<span>
					{formatDistanceToNow(new Date(comment.createdAt), {
						addSuffix: true,
					})}
				</span>
			</div>

			<div className="mb-2">
				<RichContentViewer content={comment.content} />
			</div>

			<div className="flex gap-2 items-center text-xs text-muted-foreground mb-2">
				<Button
					onClick={handleLikeToggle}
					disabled={loadingLike || !session?.user}
					variant="ghost"
					className={cn("flex items-center gap-1 text-muted-foreground", {
						"text-red-500": isLiked,
					})}>
					{isLiked ? (
						<Heart className="h-4 w-4 fill-red-500" />
					) : (
						<Heart className="h-4 w-4" />
					)}
					<span>{likeCount}</span>
				</Button>
				<Button
					variant="ghost"
					onClick={() => setReplying((r) => !r)}
					className="hover:text-blue-500">
					<MessageCircle className="w-4 h-4" />
				</Button>
				{isAuthor && (
					<Button
						variant="ghost"
						onClick={handleDelete}
						className="hover:text-red-500">
						<Trash className="w-4 h-4" />
					</Button>
				)}
			</div>

			{replying && (
				<div className="mt-2">
					<CommentForm
						postId={postId}
						parentId={comment.id}
						onSuccess={() => {
							setReplying(false);
							onReply(); // refresh after reply
						}}
					/>
				</div>
			)}

			{/* Recursive replies */}
			<div className="mt-3 space-y-2">
				{comment.replies?.map((reply) => (
					<CommentItem
						key={reply.id}
						comment={reply}
						postId={postId}
						onReply={onReply}
						likedCommentIds={likedCommentIds}
						onRefreshLikedComments={onRefreshLikedComments}
					/>
				))}
			</div>
		</div>
	);
}
