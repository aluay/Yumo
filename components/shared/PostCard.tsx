"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { postPayloadSchemaType } from "@/lib/schemas/postSchema";
import moment from "moment";
import { getSafeVariant } from "@/lib/badgeVariants";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
	post: postPayloadSchemaType;
}

export function PostCard({ post }: PostCardProps) {
	return (
		<div
			key={post.id}
			className="rounded-md border bg-background transition-shadow p-4 space-y-3 max-w-full">
			{/* Title */}
			<h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
				<Link
					href={`/post/${post.id}`}
					className="relative inline-block transition-colors duration-200 hover:text-sky-500">
					{post.title}
				</Link>
			</h2>

			{/* Description */}
			<p className="text-sm text-muted-foreground line-clamp-3">
				{post.description}
			</p>

			{/* Badges */}
			<div className="flex flex-wrap gap-2">
				{/* <Link href={`/tags/${encodeURIComponent(post.language)}`}>
					<Badge variant={getSafeVariant(post.language.toLowerCase())}>
						#{post.language}
					</Badge>
				</Link> */}
				{post.tags?.map((tag, index) => (
					<Link key={index} href={`/tags/${encodeURIComponent(tag)}`}>
						<Badge variant={getSafeVariant(tag.toLowerCase())} key={tag}>
							#{tag}
						</Badge>
					</Link>
				))}
			</div>

			{/* Footer row */}
			<div className="flex items-center justify-between mt-4">
				{/* User info */}
				<div className="flex items-center gap-2">
					<Avatar className="h-[24px] w-[24px]">
						{post?.author?.image ? (
							<AvatarImage src={post?.author.image} alt={post?.author.name} />
						) : (
							<AvatarFallback>{post?.author?.name.charAt(0)}</AvatarFallback>
						)}
					</Avatar>
					<div className="text-sm">
						<Link
							href={`/user/${post?.author?.id}`}
							className="relative inline-block transition-colors duration-200 hover:text-red-500">
							<div className="font-medium">{post?.author?.name}</div>
						</Link>
						<div className="text-xs text-muted-foreground">
							{moment(post.createdAt).fromNow()}
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						❤️ <span>{formatNumber(post.likes)}</span>
					</div>
					<div className="flex items-center gap-1">
						🗨️ <span>{formatNumber(post._count.Comment)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
