import { getPosts } from "@/lib/api/api";
import PostsListClient from "@/components/shared/PostsListClient";

interface PostsListProps {
	sort?: "new" | "top" | "hot";
}

export default async function PostsList({ sort = "new" }: PostsListProps) {
	// Fetch posts based on the limit and sort
	const { posts, nextCursor } = await getPosts({ limit: 10, sort });

	return (
		<PostsListClient
			initialPosts={posts}
			initialCursor={nextCursor}
			initialSort={sort}
		/>
	);
}
