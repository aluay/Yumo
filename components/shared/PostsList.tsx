import { getPosts } from "@/lib/api/api";
import PostsListClient from "@/components/shared/PostsListClient";

export default async function PostsList() {
	// Fetch posts based on the limit and sort
	const { posts, nextCursor } = await getPosts({ limit: 2, sort: "new" });

	return <PostsListClient initialPosts={posts} initialCursor={nextCursor} />;
}
