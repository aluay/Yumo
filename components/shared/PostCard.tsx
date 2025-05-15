"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostPayload } from "@/lib/validation/post";
import { formatDistanceToNow } from "date-fns";
import { formatNumber, cn } from "@/lib/utils";
import { Heart, MessageCircle, Clock, ArrowUpRight } from "lucide-react";
import BookmarkPostButton from "./BookmarkPostButton";
import LikePostButton from "@/components/shared/LikePostButton";
import TagBadge from "@/components/shared/TagBadge";
import { estimateReadingTime } from "@/lib/readingTime";

interface PostCardProps {
	post: PostPayload & { slug?: string };
}

export default function PostCard({ post }: PostCardProps) {
	const { data: session } = useSession();
	const userId = Number(session?.user?.id) ?? null;
	const readingTime = estimateReadingTime(post.content);

	const userHasBookmarked =
		userId != null && post.bookmarks?.some((b) => b.userId === userId);
	const userHasLiked =
		userId != null && post.likes?.some((like) => like.userId === userId);

	const postUrl = post.slug
		? `/posts/${post.id}-${post.slug}`
		: `/posts/${post.id}`;

	return (
		<article className="group relative overflow-hidden border border-border/50 rounded-lg bg-card shadow-sm max-w-xl min-h-[220px] w-full flex flex-col">
			<div className="flex flex-col h-full relative z-0 flex-grow">
				<div className="flex items-center justify-between p-2.5 border-b border-border/40">
					<Link
						href={`/users/${post.author.id}`}
						className="flex items-center gap-1.5 hover:opacity-80 group/avatar">
						<Avatar className="h-7 w-7 ring-1 ring-background group-hover/avatar:ring-primary/30">
							{post.author.image ? (
								<AvatarImage src={post.author.image} alt={post.author.name} />
							) : (
								<AvatarFallback className="bg-primary/10 text-primary font-medium">
									{post.author.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							)}
						</Avatar>
						<div>
							<p className="text-sm font-medium group-hover/avatar:text-primary">
								{post.author.name}
							</p>
						</div>
					</Link>
					<div className="flex items-center text-xs text-muted-foreground group/timestamp hover:text-primary/70">
						<Clock className="w-2.5 h-2.5 mr-1 group-hover/timestamp:text-primary/70" />
						<time dateTime={post.createdAt}>
							{formatDistanceToNow(new Date(post.createdAt), {
								addSuffix: true,
							})}
						</time>
					</div>
				</div>

				<Link
					href={postUrl}
					className="flex-1 flex flex-col p-3 hover:bg-accent/5 relative group/content flex-grow">
					<div className="mb-1.5 flex items-center gap-2">
						<h2 className="text-lg sm:text-xl font-bold tracking-tight leading-tight line-clamp-2 hover:text-primary/80">
							{post.title}
						</h2>
					</div>
					<div className="flex-grow">
						<p className="text-muted-foreground text-xs line-clamp-2">
							{post.description}
						</p>
					</div>
					<div className="absolute bottom-2 right-2 opacity-0 group-hover/content:opacity-100 transition-opacity duration-150">
						<div className="flex items-center gap-0.5 text-xs font-medium text-primary">
							<span>Read more</span>
							<ArrowUpRight className="w-2.5 h-2.5" />
						</div>
					</div>

					{post.tags?.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mt-auto animate-stagger-fade-in">
							{post.tags.map((tag, index) => (
								<TagBadge
									key={index}
									tag={tag}
									className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-150 text-xs py-0.5 px-1.5"
								/>
							))}
						</div>
					)}
				</Link>

				<div className="flex items-center justify-between p-2 pt-1.5 border-t border-border/40 bg-muted/30 animate-stagger-fade-in">
					<div className="flex items-center space-x-3 text-xs">
						{userId ? (
							<LikePostButton
								postId={post.id}
								initialLiked={userHasLiked}
								initialCount={post.likeCount}
							/>
						) : (
							<div className="flex items-center gap-1.5 text-muted-foreground group/likes">
								<Heart
									className={cn(
										"w-3.5 h-3.5",
										userHasLiked && "fill-rose-500 text-rose-500"
									)}
								/>
								<span
									className={cn("relative", userHasLiked && "text-rose-500")}>
									{formatNumber(post.likeCount)}
									<span className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-200/20 to-transparent opacity-0 group-hover/likes:opacity-100 animate-shine"></span>
								</span>
							</div>
						)}

						<Link
							href={`${postUrl}#comments`}
							className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-colors duration-100 group/comments">
							<MessageCircle className="w-3.5 h-3.5 transition-colors duration-100" />
							<span className="group-hover/comments:text-blue-500 transition-colors duration-100 relative">
								{formatNumber(post._count.comments)}
								<span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent opacity-0 group-hover/comments:opacity-100 animate-shine"></span>
							</span>
						</Link>
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<BookmarkPostButton
							postId={post.id}
							initialBookmarked={userHasBookmarked}
						/>
						{readingTime.words > 0 && (
							<span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/60 rounded px-2 py-0.5 ml-1">
								{readingTime.display}
							</span>
						)}
					</div>
				</div>
			</div>
		</article>
	);
}
