import { notFound, redirect } from "next/navigation";
import RichContentViewer from "@/components/shared/RichContentViewer";
import { Badge } from "@/components/ui/badge";
import type { JSONContent } from "@tiptap/react";
import { getPostById } from "@/lib/api/api";
import PageLayout from "@/components/layouts/PageLayout";
import { auth } from "@/lib/auth";
import LikePostButton from "@/components/shared/LikePostButton";
import CommentThread from "@/components/shared/CommentThread";
import BookmarkPostButton from "@/components/shared/BookmarkPostButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DeletePostButton from "@/components/shared/DeletePostButton";
import { Pencil, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { estimateReadingTime } from "@/lib/readingTime";
import TagBadge from "@/components/shared/TagBadge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug?: string }>;
}) {
	const { slug = "" } = await params;
	const [id] = slug.split("-");
	const numericPostId = Number(id);
	if (isNaN(numericPostId)) return {};
	const post = await getPostById(numericPostId);
	if (!post) return {};
	return {
		title: `Yumo | ${post.title}`,
		description: post.description,
	};
}

export default async function PostViewPage({
	params,
}: {
	params: Promise<{ slug?: string }>;
}) {
	const { slug = "" } = await params;
	const [id] = slug.split("-");
	const numericPostId = Number(id);
	const session = await auth();
	if (isNaN(numericPostId)) notFound();
	const post = await getPostById(numericPostId);
	if (!post) notFound();
	if (post.status === "DRAFT" && Number(session?.user?.id) !== post.author.id) {
		return notFound();
	}
	// Validate slug and redirect if not canonical
	if (slug !== `${post.id}-${post.slug}`) {
		redirect(`/posts/${post.id}-${post.slug}`);
	}
	const userHasLiked =
		post.likes?.some((user) => user.userId === Number(session?.user?.id)) ??
		false;
	const userHasBookmarked =
		post.bookmarks?.some((user) => user.userId === Number(session?.user?.id)) ??
		false;
	const readingTime = estimateReadingTime(post.content);
	return (
		<PageLayout>
			<article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative z-0">
				{/* Top Action Bar - Admin Controls */}
				{Number(session?.user?.id) === post.author.id && (
					<div className="sticky top-[4.5rem] z-10 flex justify-between gap-2 py-2 bg-background/80 backdrop-blur-sm rounded-lg mb-6 px-4 border border-border/30 shadow-sm">
						<DeletePostButton postId={post.id} />
						<Button
							size="icon"
							variant="default"
							className="gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
							asChild>
							<Link href={`/posts/${post.id}/edit`}>
								<Pencil className="h-4 w-4" />
								{/* <span>Edit</span> */}
							</Link>
						</Button>
					</div>
				)}
				{/* Hero Section */}{" "}
				<header className="mb-10 relative">
					{/* Title and Description */}
					<div className="space-y-4 mb-8">
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
							{post.title}
						</h1>
						{post.description && (
							<p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
								{post.description}
							</p>
						)}
					</div>{" "}
					{/* Author and Post Metadata */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-y border-border/60">
						{/* Author Info */}
						<div className="flex items-center gap-3">
							<Link
								href={`/users/${post.author?.id}`}
								className="group/author flex items-center gap-3 hover:opacity-90 transition-opacity">
								<div className="relative">
									<div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 blur opacity-0 group-hover/author:opacity-100 transition-opacity"></div>
									<Avatar className="h-10 w-10 border border-border/50 shadow-sm transition-all relative group-hover/author:border-primary/20">
										<AvatarImage
											src={post.author?.image || ""}
											alt={post.author?.name || "Avatar"}
										/>
										<AvatarFallback className="bg-primary/10 text-primary font-medium">
											{post.author?.name?.slice(0, 2).toUpperCase() || "UN"}
										</AvatarFallback>
									</Avatar>
								</div>
								<div className="flex flex-col">
									<span className="font-medium text-sm group-hover/author:text-primary transition-colors">
										{post.author?.name}
									</span>
									<span className="text-xs text-muted-foreground">
										Posted{" "}
										{formatDistanceToNow(new Date(post.createdAt), {
											addSuffix: true,
										})}
									</span>
								</div>
							</Link>
						</div>

						{/* Post Actions */}
						<div className="flex items-center gap-3">
							{Number(session?.user?.id) === post.author.id && (
								<Badge variant="outline" className="animate-pulse">
									{post.status}
								</Badge>
							)}
							<div className="flex items-center gap-2 bg-muted/50 hover:bg-muted/70 transition-colors py-1.5 px-3 rounded-full border border-border/40">
								<LikePostButton
									postId={post.id}
									initialLiked={userHasLiked}
									initialCount={post.likeCount}
								/>
								<BookmarkPostButton
									postId={post.id}
									initialBookmarked={userHasBookmarked}
									initialCount={post.bookmarkCount}
								/>
								{readingTime.words > 0 && (
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border/60 pl-2">
										<Clock className="h-3 w-3" />
										<span>{readingTime.display}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</header>{" "}
				{/* Tags Section */}
				{post.tags.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-8 pb-4">
						{post.tags.map((tag, index) => (
							<div
								key={index}
								className="transition-all duration-200"
								style={{ animationDelay: `${index * 100}ms` }}>
								<TagBadge
									tag={tag}
									className="hover:scale-105 hover:shadow-md hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-200 text-xs py-1 px-2.5"
								/>
							</div>
						))}
					</div>
				)}
				{/* Main Content */}
				{post.content && (
					<div className="relative">
						<div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl blur-xl opacity-50"></div>
						<div className="relative bg-background p-4 sm:p-8 rounded-lg shadow-sm border border-border/50">
							<div className="prose prose-lg dark:prose-invert max-w-none">
								<RichContentViewer content={post.content as JSONContent} />
							</div>
						</div>
					</div>
				)}{" "}
				{/* Comments Section */}
				<div className="relative mt-16 mb-4">
					<div className="flex items-center justify-center mb-8">
						<div className="h-px bg-border flex-grow"></div>
						<div className="mx-4 text-muted-foreground font-medium">
							Discussion
						</div>
						<div className="h-px bg-border flex-grow"></div>
					</div>
					<div className="bg-muted/30 rounded-lg border border-border/40 shadow-sm p-4 sm:p-6">
						<CommentThread postId={post.id} />
					</div>
				</div>
			</article>
		</PageLayout>
	);
}
