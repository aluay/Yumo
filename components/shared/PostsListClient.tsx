"use client";

import { useState } from "react";
import PostCard from "@/components/shared/PostCard";
import { PostPayload } from "@/lib/validation/post";
import { Button } from "@/components/ui/button";

interface Props {
	initialPosts: PostPayload[];
	initialCursor: number | null;
}

export default function PostsListClient({
	initialPosts,
	initialCursor,
}: Props) {
	const [posts, setPosts] = useState(initialPosts);
	const [cursor, setCursor] = useState(initialCursor);
	const [loading, setLoading] = useState(false);

	const loadMore = async () => {
		if (!cursor) return;

		setLoading(true);
		try {
			const res = await fetch(`/api/v1/posts?cursor=${cursor}&limit=5`);
			const json = await res.json();

			setPosts((prev) => [...prev, ...json.data]);
			setCursor(json.nextCursor);
		} catch (err) {
			console.error("Failed to load more posts", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6 flex flex-col">
			{posts.map((post) => (
				<div key={post.id} className="w-full">
					<PostCard post={post} />
				</div>
			))}
			{cursor && (
				<Button onClick={loadMore} disabled={loading}>
					{loading ? "Loading..." : "Load more"}
				</Button>
			)}
		</div>
	);
}
