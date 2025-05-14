import { notFound } from "next/navigation";
import RichContentViewer from "@/components/shared/RichContentViewer";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { getPostById } from "@/lib/api/api";
import PageLayout from "@/components/layouts/PageLayout";
// import { getTagColorClasses } from "@/lib/badgeVariants";
import { auth } from "@/lib/auth";
import LikePostButton from "@/components/shared/LikePostButton";
import CommentThread from "@/components/shared/CommentThread";
import BookmarkPostButton from "@/components/shared/BookmarkPostButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DeletePostButton from "@/components/shared/DeletePostButton";
import { Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// This function is used to generate metadata for the page
export async function generateMetadata({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;
	const numericPostId = Number(postId);
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
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;
	const numericPostId = Number(postId);
	const session = await auth();

	if (isNaN(numericPostId)) {
		notFound();
	}

	const post = await getPostById(numericPostId);

	if (!post) notFound();

	// If a user tries to access /post/[id] and it's a draft and they're not the author, they see a 404 page.
	if (post.status === "DRAFT" && Number(session?.user?.id) !== post.author.id) {
		return notFound();
	}

	const userHasLiked =
		post.likes?.some((user) => user.userId === Number(session?.user?.id)) ??
		false;

	const userHasBookmarked =
		post.bookmarks?.some((user) => user.userId === Number(session?.user?.id)) ??
		false;

	return (
		<PageLayout>
			<div className="space-y-6 px-2">
				<div className="flex flex-row-reverse gap-2">
					{Number(session?.user?.id) === post.author.id && (
						<Button size="icon" variant="secondary" asChild>
							<Link href={`/posts/${post.id}/edit`}>
								<Pencil />
							</Link>
						</Button>
					)}
					{Number(session?.user?.id) === post.author.id && (
						<DeletePostButton postId={post.id} />
					)}
				</div>
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<Link
							href={`/users/${post.author?.id}`}
							className="hover:underline">
							{post.author?.image && (
								<Image
									src={post.author.image}
									alt={post.author.name}
									width={38}
									height={38}
									className="rounded-full"
								/>
							)}
						</Link>
						<div className="flex flex-col gap-1">
							<Link
								href={`/users/${post.author?.id}`}
								className="hover:underline">
								<span>{post.author?.name}</span>
							</Link>

							<span>
								Posted&nbsp;
								{formatDistanceToNow(new Date(post.createdAt), {
									addSuffix: true,
								})}
							</span>
						</div>
					</div>
					<div className="flex gap-2 items-center">
						{Number(session?.user.id) === post.author.id && (
							<Badge variant="outline">{post.status}</Badge>
						)}
						<LikePostButton
							postId={post.id}
							initialLiked={userHasLiked}
							initialCount={post.likeCount}
						/>
						<BookmarkPostButton
							postId={post.id}
							initialBookmarked={userHasBookmarked}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-snug sm:leading-tight">
						{post.title}
					</h1>
					<div className="mt-2 sm:mt-3">
						{post.description && (
							<p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
								{post.description}
							</p>
						)}
					</div>

					<div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
						{post.tags.map((tag, index) => (
							<Link
								href={`/tags/${encodeURIComponent(tag)}`}
								key={index}
								className="hover:text-foreground transition-colors">
								<span className="font-medium">#{tag}</span>
							</Link>
						))}
					</div>
				</div>

				{post.content && (
					<div>
						<RichContentViewer content={post.content as JSONContent} />
					</div>
				)}
				<CommentThread postId={post.id} />
			</div>
		</PageLayout>
	);
}
