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
				<Link href={`/tags/${encodeURIComponent(post.language)}`}>
					<Badge variant={getSafeVariant(post.language.toLowerCase())}>
						#{post.language}
					</Badge>
				</Link>
				{post.tags?.map((tag, index) => (
					<Link key={index} href={`/tags/${encodeURIComponent(tag)}`}>
						<Badge key={tag}>#{tag}</Badge>
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
						<div className="font-medium">{post?.author?.name}</div>
						<div className="text-xs text-muted-foreground">
							{moment(post.createdAt).fromNow()}
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						❤️ <span>{post?.likedBy?.length}</span>
					</div>
					<div className="flex items-center gap-1">
						👁️ <span>{formatNumber(post.views)}</span>
					</div>
				</div>
			</div>
		</div>

		// <Card
		// 	key={id}
		// 	className="flex flex-col justify-between hover:border-zinc-500">
		// 	<CardHeader className="p-4 pb-0">
		// 		<CardTitle className="flex items-center justify-between font-normal text-[18px]">
		// 			<Link href={`/post/${id}`} className="hover:underline">
		// 				<h1>{title}</h1>
		// 			</Link>
		// 			<span className="text-xs text-muted-foreground leading-none">
		// 				{moment(createdAt).fromNow()}
		// 			</span>
		// 		</CardTitle>
		// 		<CardDescription>
		// 			{truncateText(description ?? "", 100)}
		// 		</CardDescription>
		// 	</CardHeader>

		// 	<CardContent className="flex justify-between items-center p-4">
		// 		<div className="flex flex-wrap gap-1">
		// 			<Link href={`/tags/${encodeURIComponent(language)}`}>
		// 				<Badge variant={getSafeVariant(language.toLowerCase())}>
		// 					{language}
		// 				</Badge>
		// 			</Link>
		// 			{tags?.map((tag, index) => (
		// 				<Link key={index} href={`/tags/${encodeURIComponent(tag)}`}>
		// 					<Badge key={index} variant="outline">
		// 						{tag}
		// 					</Badge>
		// 				</Link>
		// 			))}
		// 		</div>
		// 	</CardContent>

		// 	<CardFooter className="border-t px-4 py-3 flex items-center justify-between">
		// 		<div className="flex items-center gap-2 leading-none">
		// 			<Avatar className="h-[24px] w-[24px]">
		// 				{author?.image ? (
		// 					<AvatarImage src={author.image} alt={author.name} />
		// 				) : (
		// 					<AvatarFallback>{author?.name.charAt(0)}</AvatarFallback>
		// 				)}
		// 			</Avatar>
		// 			<Link href={`/user/${author?.id}`} className="hover:underline">
		// 				<span className="text-[14px]">{author?.name}</span>
		// 			</Link>
		// 		</div>
		// 		<div className="flex items-center gap-4">
		// 			<div className="flex items-center gap-1">
		// 				<ThumbsUp className="h-4 w-4" />
		// 				<span className="text-xs text-muted-foreground leading-none">
		// 					{formatNumber(likes)}
		// 				</span>
		// 			</div>
		// 			<div className="flex items-center gap-1">
		// 				<Eye className="h-4 w-4" />
		// 				<span className="text-xs text-muted-foreground leading-none">
		// 					{formatNumber(views)}
		// 				</span>
		// 			</div>
		// 		</div>
		// 	</CardFooter>
		// </Card>
	);
}
