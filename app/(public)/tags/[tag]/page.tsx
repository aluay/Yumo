import { getTagPosts } from "@/lib/api/api";
import PostCard from "@/components/shared/PostCard";
import PageLayout from "@/components/layouts/PageLayout";

export default async function TagsPage({
	params,
}: {
	params: Promise<{ tag: string }>;
}) {
	const { tag } = await params;
	const tagName = decodeURIComponent(tag);
	const posts = await getTagPosts(tagName);

	if (!posts.length) {
		return (
			<div className="text-center py-20">
				<h2 className="text-lg font-semibold">No results found</h2>
				<p className="text-sm text-muted-foreground mt-2">
					No posts to show here.
				</p>
			</div>
		);
	}

	return (
		<PageLayout>
			<div className="space-y-6">
				{posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
		</PageLayout>
	);
}
