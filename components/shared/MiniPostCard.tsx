import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import TagBadge from "@/components/shared/TagBadge";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Clock } from "lucide-react";

interface MiniPostCardProps {
	post: {
		id: number;
		title: string;
		tags: string[];
		createdAt: string;
		author: {
			id: number;
			name: string;
			image: string | null;
		};
		slug: string;
	};
	bookmarkedAt?: string;
}

export const MiniPostCard: React.FC<MiniPostCardProps> = ({ post }) => {
	const postUrl = post.slug
		? `/posts/${post.id}-${post.slug}`
		: `/posts/${post.id}`;

	return (
		<article className="group relative overflow-hidden border border-border/50 rounded-lg bg-card shadow-sm min-h-[100px] w-full flex flex-col">
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
			</div>
		</article>
	);
};
