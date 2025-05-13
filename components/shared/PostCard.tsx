import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostPayload } from "@/lib/validation/post";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/lib/utils";
import { Heart, MessageCircle } from "lucide-react";
import BookmarkPostButton from "./BookmarkPostButton";
import { auth } from "@/lib/auth";

interface PostCardProps {
	post: PostPayload;
}

export default async function PostCard({ post }: PostCardProps) {
	const session = await auth();
	const userId = Number(session?.user?.id) ?? null;

	const userHasBookmarked =
		userId != null && post.bookmarks?.some((b) => b.userId === userId);

	return (
		<article className="border p-4 rounded-lg bg-muted/50 shadow-sm">
			<div>
				<div className="mb-4">
					<Link href={`/users/${post.author.id}`} className="hover:underline">
						<div className="flex items-center gap-2">
							<div>
								<Avatar className="h-6 w-6">
									{post.author.image ? (
										<AvatarImage
											src={post.author.image}
											alt={post.author.name}
										/>
									) : (
										<AvatarFallback>
											{post.author.name.charAt(0)}
										</AvatarFallback>
									)}
								</Avatar>
							</div>
							<div>
								<p className="text-sm">{post.author.name}</p>
							</div>
						</div>
					</Link>
				</div>
				<div className="pb-3">
					<div>
						<Link href={`/posts/${post.id}`}>
							<div>
								<div>
									<h2 className="sm:text-1xl md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug sm:leading-tight">
										{post.title}
									</h2>
								</div>
								<div className="pt-2">
									<p className="text-muted-foreground">{post.description}</p>
								</div>
							</div>
						</Link>
					</div>
				</div>
				<div className="py-2">
					{post.tags?.length > 0 && (
						<div className="flex flex-wrap gap-4">
							{post.tags.map((tag, index) => (
								<Link
									key={index}
									href={`/tags/${encodeURIComponent(tag)}`}
									className="text-muted-foreground hover:text-primary">
									#{tag}
								</Link>
							))}
						</div>
					)}
				</div>
				<span className="flex items-center justify-between">
					<div className="flex gap-6 items-center py-4 text-sm text-muted-foreground">
						{formatDistanceToNow(new Date(post.createdAt), {
							addSuffix: true,
						})}
						<div className="flex items-center gap-6">
							<div className="flex items-center gap-1">
								<Heart className="w-4 h-4" />
								<span>{formatNumber(post.likeCount)}</span>
							</div>
							<div className="flex items-center gap-1">
								<MessageCircle className="w-4 h-4" />
								<span>{formatNumber(post._count.comments)}</span>
							</div>
						</div>
					</div>
					<div>
						<BookmarkPostButton
							postId={post.id}
							initialBookmarked={userHasBookmarked}
						/>
					</div>
				</span>
			</div>
		</article>
	);
}
