"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/shared/PostCard";
import { Button } from "@/components/ui/button";
import { PostPayload } from "@/lib/validation/post";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Flame, Clock, TrendingUp } from "lucide-react";

const SESSION_STORAGE_POSTS_KEY = "paginatedPosts_posts";
const SESSION_STORAGE_CURSOR_KEY = "paginatedPosts_cursor";
const SESSION_STORAGE_SORT_KEY = "paginatedPosts_sort";

type SortOption = "new" | "top" | "hot";

interface Props {
	initialPosts: PostPayload[];
	initialCursor: number | null;
	initialSort?: SortOption;
}

export default function PostsListClient({
	initialPosts,
	initialCursor,
	initialSort = "new",
}: Props) {
	// Initialize with props for consistent server/client first render
	const [posts, setPosts] = useState<PostPayload[]>(initialPosts);
	const [cursor, setCursor] = useState<string | null>(
		initialCursor !== null ? String(initialCursor) : null
	);
	const [sort, setSort] = useState<SortOption>(initialSort);
	const [loading, setLoading] = useState(false);
	const [hydrated, setHydrated] = useState(false);
	// Effect for hydration and loading from sessionStorage (runs once on client mount)
	useEffect(() => {
		setHydrated(true); // Mark that hydration has occurred

		const storedPostsJson = sessionStorage.getItem(SESSION_STORAGE_POSTS_KEY);
		const storedCursorValue = sessionStorage.getItem(
			SESSION_STORAGE_CURSOR_KEY
		);
		const storedSortValue = sessionStorage.getItem(
			SESSION_STORAGE_SORT_KEY
		) as SortOption | null;
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

					// Load sort preference if available
					if (
						storedSortValue &&
						["new", "top", "hot"].includes(storedSortValue)
					) {
						setSort(storedSortValue as SortOption);
					}

					loadedFromStorage = true;
				} else {
					// Clear storage if data is invalid
					sessionStorage.removeItem(SESSION_STORAGE_POSTS_KEY);
					sessionStorage.removeItem(SESSION_STORAGE_CURSOR_KEY);
					sessionStorage.removeItem(SESSION_STORAGE_SORT_KEY);
				}
			} catch (err) {
				console.error(
					"CLIENT: Failed to parse posts from sessionStorage. Clearing.",
					err
				);
				sessionStorage.removeItem(SESSION_STORAGE_POSTS_KEY);
				sessionStorage.removeItem(SESSION_STORAGE_CURSOR_KEY);
				sessionStorage.removeItem(SESSION_STORAGE_SORT_KEY);
			}
		} else {
			// If posts aren't in storage (possibly cleared by like/bookmark),
			// but sort preference is available, use that sort and fetch posts
			if (storedSortValue && ["new", "top", "hot"].includes(storedSortValue)) {
				const sortPref = storedSortValue as SortOption;
				setSort(sortPref);

				// Only fetch if the sort preference is different from initialSort
				if (sortPref !== initialSort) {
					// Fetch posts with the saved sort preference
					const fetchPosts = async () => {
						setLoading(true);
						try {
							const res = await fetch(
								`/api/v1/posts?sort=${sortPref}&limit=10`
							);
							const json = await res.json();

							if (res.ok && Array.isArray(json.data)) {
								setPosts(json.data);
								setCursor(json.nextCursor);
							} else {
								console.error("Failed to load posts with saved sort", json);
							}
						} catch (err) {
							console.error("Failed to load posts with saved sort", err);
						} finally {
							setLoading(false);
						}
					};

					fetchPosts();
				}
			}
		}

		if (!loadedFromStorage) {
			// If nothing valid in sessionStorage, state already holds initialPosts/initialCursor from useState.
		}
	}, [initialSort]); // Include initialSort as a dependency
	// Effect to save posts, cursor, and sort to sessionStorage when they change, only after hydration
	useEffect(() => {
		if (!hydrated) {
			// Don't save to sessionStorage until after hydration and initial load from storage is attempted.
			return;
		}
		if (typeof window !== "undefined") {
			try {
				sessionStorage.setItem(
					SESSION_STORAGE_POSTS_KEY,
					JSON.stringify(posts)
				);
				sessionStorage.setItem(SESSION_STORAGE_CURSOR_KEY, cursor ?? "");
				sessionStorage.setItem(SESSION_STORAGE_SORT_KEY, sort);
			} catch (err) {
				console.error(
					"CLIENT: Failed to save posts/cursor/sort to sessionStorage",
					err
				);
			}
		}
	}, [posts, cursor, sort, hydrated]); // Depend on posts, cursor, sort, and hydrated status
	// Handle changing sort option
	const handleSortChange = async (newSort: SortOption) => {
		if (newSort === sort) return; // No change

		setLoading(true);
		try {
			// Reset posts list with new sort option
			const res = await fetch(`/api/v1/posts?sort=${newSort}&limit=10`);
			const json = await res.json();

			if (res.ok && Array.isArray(json.data)) {
				setPosts(json.data);
				setCursor(json.nextCursor);
				setSort(newSort);
			} else {
				console.error("Failed to load posts with new sort", json);
			}
		} catch (err) {
			console.error("Failed to load posts with new sort", err);
		} finally {
			setLoading(false);
		}
	};

	const loadMore = async () => {
		if (!cursor) return;

		setLoading(true);
		try {
			const res = await fetch(
				`/api/v1/posts?cursor=${cursor}&limit=5&sort=${sort}`
			);
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
		return (
			<div className="space-y-6 max-w-7xl mx-auto">
				<div className="flex justify-end mb-4">
					<Button
						variant="outline"
						className="flex items-center gap-2"
						disabled>
						{initialSort === "new" && (
							<>
								<Clock className="h-4 w-4" />
								<span>New</span>
							</>
						)}
						{initialSort === "top" && (
							<>
								<TrendingUp className="h-4 w-4" />
								<span>Top</span>
							</>
						)}
						{initialSort === "hot" && (
							<>
								<Flame className="h-4 w-4" />
								<span>Hot</span>
							</>
						)}
						<ChevronDown className="h-4 w-4 ml-1" />
					</Button>
				</div>

				{initialPosts.length === 0 ? (
					<div className="text-center p-8">
						<p className="text-muted-foreground">No posts found</p>
					</div>
				) : (
					initialPosts.map((post) => (
						<div key={post.id}>
							<PostCard post={post} />
						</div>
					))
				)}

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
			<div className="flex justify-end mb-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="flex items-center gap-2">
							{sort === "new" && (
								<>
									<Clock className="h-4 w-4" />
									<span>New</span>
								</>
							)}
							{sort === "top" && (
								<>
									<TrendingUp className="h-4 w-4" />
									<span>Top</span>
								</>
							)}
							{sort === "hot" && (
								<>
									<Flame className="h-4 w-4" />
									<span>Hot</span>
								</>
							)}
							<ChevronDown className="h-4 w-4 ml-1" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => handleSortChange("new")}
							className={sort === "new" ? "bg-accent" : ""}>
							<Clock className="h-4 w-4 mr-2" />
							<span>New</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleSortChange("top")}
							className={sort === "top" ? "bg-accent" : ""}>
							<TrendingUp className="h-4 w-4 mr-2" />
							<span>Top</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleSortChange("hot")}
							className={sort === "hot" ? "bg-accent" : ""}>
							<Flame className="h-4 w-4 mr-2" />
							<span>Hot</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{posts.length === 0 ? (
				<div className="text-center p-8">
					<p className="text-muted-foreground">No posts found</p>
				</div>
			) : (
				posts.map((post) => (
					<div key={post.id}>
						<PostCard post={post} />
					</div>
				))
			)}

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
