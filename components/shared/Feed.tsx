"use client";

import { useEffect, useState } from "react";
import { postPayloadSchemaType } from "@/lib/schemas/postSchema";
import { PostCard } from "@/components/shared/PostCard";
import { fetchPosts } from "@/lib/api/api";
import { useSession } from "next-auth/react";

interface FeedProps {
	endpoint: string;
	pageTitle: string;
	emptyTitle?: string;
	emptyMessage?: string;
}

export default function Feed({
	endpoint,
	pageTitle,
	emptyTitle = "No results found",
	emptyMessage = "We couldn't find any posts to show here.",
}: FeedProps) {
	const [posts, setPosts] = useState<postPayloadSchemaType[]>([]);
	const [loading, setLoading] = useState(true);
	const { data: session } = useSession();

	useEffect(() => {
		async function load() {
			try {
				const data = await fetchPosts(endpoint);
				console.log("POSTS: ", data);
				setPosts(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [endpoint]);

	if (loading) {
		return <p className="text-muted-foreground">Loading...</p>;
	}

	if (posts.length === 0) {
		return (
			<div className="text-center py-20">
				<h2 className="text-lg font-semibold">{emptyTitle}</h2>
				<p className="text-sm text-muted-foreground mt-2">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<>
			<h2 className="scroll-m-20 py-2 text-3xl font-semibold tracking-tight first:mt-0">
				{pageTitle}
			</h2>
			<div className="relative flex flex-col gap-4">
				{posts
					.filter((post) => {
						// If user is logged in and is the author, include all posts
						if (session?.user?.id === post.author?.id) return true;

						// Otherwise, only include published posts
						return post.status === "PUBLISHED";
					})
					.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
			</div>
		</>
	);
}
