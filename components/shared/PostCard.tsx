"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { postPayloadSchemaType } from "@/lib/schemas/postSchema";
import moment from "moment";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getSafeVariant } from "@/lib/badgeVariants";
import { ThumbsUp, Eye } from "lucide-react";
import { formatNumber, truncateText } from "@/lib/utils";

interface PostCardProps {
	post: postPayloadSchemaType;
}

export function PostCard({ post }: PostCardProps) {
	const {
		id,
		title,
		description,
		language,
		tags,
		likes,
		views,
		author,
		createdAt,
	} = post;

	return (
		<Card
			key={id}
			className="flex flex-col justify-between hover:border-zinc-500">
			<CardHeader className="p-4 pb-0">
				<CardTitle className="flex items-center justify-between font-normal text-[18px]">
					<Link href={`/post/${id}`} className="hover:underline">
						<h1>{title}</h1>
					</Link>
					<span className="text-xs text-muted-foreground leading-none">
						{moment(createdAt).fromNow()}
					</span>
				</CardTitle>
				<CardDescription>
					{truncateText(description ?? "", 100)}
				</CardDescription>
			</CardHeader>

			<CardContent className="flex justify-between items-center p-4">
				<div className="flex flex-wrap gap-1">
					<Link href={`/tags/${encodeURIComponent(language)}`}>
						<Badge variant={getSafeVariant(language.toLowerCase())}>
							{language}
						</Badge>
					</Link>
					{tags?.map((tag, index) => (
						<Link key={index} href={`/tags/${encodeURIComponent(tag)}`}>
							<Badge key={index} variant="outline">
								{tag}
							</Badge>
						</Link>
					))}
				</div>
			</CardContent>

			<CardFooter className="border-t px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-2 leading-none">
					<Avatar className="h-[24px] w-[24px]">
						{author?.image ? (
							<AvatarImage src={author.image} alt={author.name} />
						) : (
							<AvatarFallback>{author?.name.charAt(0)}</AvatarFallback>
						)}
					</Avatar>
					<Link href={`/user/${author?.id}`} className="hover:underline">
						<span className="text-[14px]">{author?.name}</span>
					</Link>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1">
						<ThumbsUp className="h-4 w-4" />
						<span className="text-xs text-muted-foreground leading-none">
							{formatNumber(likes)}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Eye className="h-4 w-4" />
						<span className="text-xs text-muted-foreground leading-none">
							{formatNumber(views)}
						</span>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
