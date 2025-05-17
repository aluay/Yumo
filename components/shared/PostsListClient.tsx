"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/shared/PostCard";
import { Button } from "@/components/ui/button";
import { PostPayload } from "@/lib/validation/post";

const SESSION_STORAGE_POSTS_KEY = "paginatedPosts_posts";
const SESSION_STORAGE_CURSOR_KEY = "paginatedPosts_cursor";

interface Props {
	initialPosts: PostPayload[];
	initialCursor: number | null;
}

export default function PostsListClient({
	initialPosts,
	initialCursor,
}: Props) {
	// Initialize with props for consistent server/client first render
	const [posts, setPosts] = useState<PostPayload[]>(initialPosts);
	const [cursor, setCursor] = useState<string | null>(
		initialCursor !== null ? String(initialCursor) : null
	);
	const [loading, setLoading] = useState(false);
	const [hydrated, setHydrated] = useState(false);

	// Effect for hydration and loading from sessionStorage (runs once on client mount)
	useEffect(() => {
		setHydrated(true); // Mark that hydration has occurred

		const storedPostsJson = sessionStorage.getItem(SESSION_STORAGE_POSTS_KEY);
		const storedCursorValue = sessionStorage.getItem(
			SESSION_STORAGE_CURSOR_KEY
		);
		let loadedFromStorage = false;

		if (storedPostsJson) {
			try {
				const parsedPosts = JSON.parse(storedPostsJson) as PostPayload[];
				// Check if it's an array (could be empty or have posts)
				if (Array.isArray(parsedPosts)) {
					// Prefer sessionStorage if it exists and is an array,
					// as it reflects client-side changes (deletes, loaded more).
					setPosts(parsedPosts);
					if (storedCursorValue !== null) {
						setCursor(storedCursorValue === "" ? null : storedCursorValue);
					} else {
						// If posts were in storage but cursor wasn't, implies end of list for stored items
						// or cursor was explicitly set to null/empty.
						setCursor(null);
					}
					loadedFromStorage = true;
					// console.log("CLIENT: Loaded from sessionStorage on hydrate", parsedPosts, storedCursorValue);
				} else {
					// console.warn("CLIENT: Stored posts data is not an array. Clearing sessionStorage.");
					sessionStorage.removeItem(SESSION_STORAGE_POSTS_KEY);
					sessionStorage.removeItem(SESSION_STORAGE_CURSOR_KEY);
				}
			} catch (err) {
				console.error(
					"CLIENT: Failed to parse posts from sessionStorage. Clearing.",
					err
				);
				sessionStorage.removeItem(SESSION_STORAGE_POSTS_KEY);
				sessionStorage.removeItem(SESSION_STORAGE_CURSOR_KEY);
			}
		}

		if (!loadedFromStorage) {
			// If nothing valid in sessionStorage, state already holds initialPosts/initialCursor from useState.
			// console.log("CLIENT: sessionStorage empty or invalid, using initial props.", initialPosts, initialCursor);
		}
	}, []); // Empty dependency array: runs only once on client-side mount

	// Effect to save posts and cursor to sessionStorage when they change, only after hydration
	useEffect(() => {
		if (!hydrated) {
			// Don't save to sessionStorage until after hydration and initial load from storage is attempted.
			return;
		}
		if (typeof window !== "undefined") {
			try {
				// console.log("CLIENT: Saving to sessionStorage", posts, cursor);
				sessionStorage.setItem(
					SESSION_STORAGE_POSTS_KEY,
					JSON.stringify(posts)
				);
				sessionStorage.setItem(SESSION_STORAGE_CURSOR_KEY, cursor ?? "");
			} catch (err) {
				console.error(
					"CLIENT: Failed to save posts/cursor to sessionStorage",
					err
				);
			}
		}
	}, [posts, cursor, hydrated]); // Depend on posts, cursor, and hydrated status

	const loadMore = async () => {
		if (!cursor) return;

		setLoading(true);
		try {
			const res = await fetch(`/api/v1/posts?cursor=${cursor}&limit=5`);
			const json = await res.json();

			// Changed json.posts to json.data to match API response
			if (res.ok && Array.isArray(json.data)) {
				setPosts((prevPosts) => [...prevPosts, ...json.data]);
				setCursor(json.nextCursor);
			} else {
				console.error(
					"Failed to load more posts or data format incorrect. Response:",
					json
				);
				// Optionally, set an error state here to inform the user
			}
		} catch (err) {
			console.error("Failed to load more posts", err);
			// Optionally, set an error state here
		} finally {
			setLoading(false);
		}
	};

	if (!hydrated) {
		// Render nothing or a placeholder until hydration is complete
		// This ensures the server and client match on initial render.
		// You can also render the initialPosts directly if you prefer,
		// but this approach makes it clearer that client-side effects are pending.
		return (
			<div className="space-y-6 max-w-7xl mx-auto">
				{initialPosts.map((post) => (
					<div key={post.id}>
						{/* Removed onPostDeleted prop from PostCard */}
						<PostCard post={post} />
					</div>
				))}
				{initialCursor && (
					<div className="flex justify-center">
						<Button variant="link" disabled={true}>
							Loading...
						</Button>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-7xl mx-auto">
			{posts.map((post) => (
				<div key={post.id}>
					{/* Removed onPostDeleted prop from PostCard */}
					<PostCard post={post} />
				</div>
			))}
			<div className="flex justify-center">
				{cursor && (
					<Button variant="link" onClick={loadMore} disabled={loading}>
						{loading ? "Loading..." : "Load more"}
					</Button>
				)}
			</div>
		</div>
	);
}
