import { notFound } from "next/navigation";
import CodeViewer from "@/components/shared/CodeViewer";
import RichContentViewer from "@/components/shared/RichContentViewer";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { getPostById } from "@/lib/api/api";
import PageLayout from "@/components/layouts/PageLayout";
import { getSafeVariant } from "@/lib/badgeVariants";
import { auth } from "@/app/auth";
import LikePostButton from "@/components/shared/LikePostButton";
import CommentThread from "@/components/shared/CommentThread";
import BookmarkButton from "@/components/shared/BookmarkPostButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DeletePostButton from "@/components/shared/DeletePostButton";
import { Pencil } from "lucide-react";

export default async function PostViewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await auth();
	const post = await getPostById(Number(id));

	if (!post) notFound();

	// If a user tries to access /post/[id] and it's a draft and they're not the author, they see a 404 page.
	if (post.status === "DRAFT" && Number(session?.user?.id) !== post.authorId) {
		return notFound();
	}

	const userHasLiked =
		post.likedBy?.some((user) => user.id === Number(session?.user?.id)) ??
		false;

	const userHasBookmarked =
		post.bookmarkedBy?.some((user) => user.id === Number(session?.user?.id)) ??
		false;

	return (
		<PageLayout>
			<div className="space-y-6">
				<div className="flex justify-between">
					<h1 className="text-3xl font-bold">{post.title}</h1>
					<div className="flex gap-2">
						{Number(session?.user?.id) === post.authorId && (
							<Button size="icon" variant="default">
								<Link href={`/dashboard/edit/${post.id}`}>
									<Pencil />
								</Link>
							</Button>
						)}
						{Number(session?.user?.id) === post.authorId && (
							<DeletePostButton postId={post.id} />
						)}
					</div>
				</div>
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					{post.author?.image && (
						<Image
							src={post.author.image}
							alt="author"
							width={32}
							height={32}
							className="rounded-full"
						/>
					)}
					<Link href={`/user/${post.author?.id}`} className="hover:underline">
						<span>{post.author?.name}</span>
					</Link>
					<span>·</span>
					<span>{new Date(post.createdAt).toLocaleDateString()}</span>
					<span>·</span>
					<span>{post.views} views</span>
					<LikePostButton
						postId={post.id}
						initialLiked={userHasLiked}
						initialCount={post.likedBy?.length ?? 0}
					/>
					<BookmarkButton
						postId={post.id}
						initialBookmarked={userHasBookmarked}
					/>
					{Number(session?.user.id) === post.authorId && (
						<Badge variant={getSafeVariant(post.status.toLowerCase())}>
							{post.status}
						</Badge>
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					<Link href={`/tags/${encodeURIComponent(post.language)}`}>
						<Badge variant={getSafeVariant(post.language.toLowerCase())}>
							{post.language}
						</Badge>
					</Link>
					{post.tags.map((tag) => (
						<Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						</Link>
					))}
				</div>

				{post.description && (
					<p className="text-muted-foreground">{post.description}</p>
				)}

				<div>
					{/* <h2 className="text-lg font-semibold mb-2">Code</h2> */}
					<CodeViewer code={post.code} language={post.language} />
				</div>

				{post.content && (
					<div>
						{/* <h2 className="text-lg font-semibold mt-6 mb-2">Notes</h2> */}
						<RichContentViewer content={post.content as JSONContent} />
					</div>
				)}
				<CommentThread postId={post.id} />
			</div>
		</PageLayout>
	);
}
