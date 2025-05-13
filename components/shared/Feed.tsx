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
			<div className="space-y-6 mx-auto w-full max-w-xl flex flex-col items-center">
				{posts.map((post) => (
					<div key={post.id} className="w-full">
						<PostCard post={post} />
					</div>
				))}
			</div>
		</>
	);
}
