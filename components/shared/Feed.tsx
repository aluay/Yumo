import { getPosts } from "@/lib/api/api";
import PostCard from "@/components/shared/PostCard";

export default async function Feed() {
	const posts = await getPosts();

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
		<>
			<div className="space-y-6">
				{posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
		</>
	);
}
