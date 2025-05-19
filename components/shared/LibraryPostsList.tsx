"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/shared/PostCard";
import { Button } from "@/components/ui/button";
import { PostPayload } from "@/lib/validation/post";
import { Bookmark, ChevronDown, CalendarDays } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const SESSION_STORAGE_LIBRARY_POSTS_KEY = "library_posts";
const SESSION_STORAGE_LIBRARY_CURSOR_KEY = "library_cursor";
const SESSION_STORAGE_LIBRARY_SORT_KEY = "library_sort";

type SortOption = "recent" | "oldest";

interface BookmarkedPost {
	post: PostPayload;
	bookmarkedAt: string;
}

interface LibraryPostsListProps {
	initialPosts: BookmarkedPost[];
	initialCursor: string | null;
	initialSort?: SortOption;
}

export default function LibraryPostsList({
	initialPosts,
	initialCursor,
	initialSort = "recent",
}: LibraryPostsListProps) {
	// Initialize with props for consistent server/client first render
	const [posts, setPosts] = useState<BookmarkedPost[]>(initialPosts);
	const [cursor, setCursor] = useState<string | null>(initialCursor);
	const [sort, setSort] = useState<SortOption>(initialSort);
	const [loading, setLoading] = useState(false);
	const [hydrated, setHydrated] = useState(false);
	// State for total bookmark count
	const [totalBookmarks, setTotalBookmarks] = useState<number | null>(null);

	// Effect for hydration and loading from sessionStorage (runs once on client mount)
	useEffect(() => {
		setHydrated(true); // Mark that hydration has occurred

		const storedPostsJson = sessionStorage.getItem(
			SESSION_STORAGE_LIBRARY_POSTS_KEY
		);
		const storedCursorValue = sessionStorage.getItem(
			SESSION_STORAGE_LIBRARY_CURSOR_KEY
		);
		const storedSortValue = sessionStorage.getItem(
			SESSION_STORAGE_LIBRARY_SORT_KEY
		) as SortOption | null;
		let loadedFromStorage = false;

		if (storedPostsJson) {
			try {
				const parsedPosts = JSON.parse(storedPostsJson) as BookmarkedPost[];
				// Check if it's an array (could be empty or have posts)
				if (Array.isArray(parsedPosts)) {
					// Prefer sessionStorage if it exists and is an array
					setPosts(parsedPosts);
					if (storedCursorValue !== null) {
						setCursor(storedCursorValue === "" ? null : storedCursorValue);
					} else {
						// If posts were in storage but cursor wasn't, implies end of list for stored items
						setCursor(null);
					}

					// Load sort preference if available
					if (
						storedSortValue &&
						["recent", "oldest"].includes(storedSortValue)
					) {
						setSort(storedSortValue as SortOption);
					}

					loadedFromStorage = true;
				} else {
					// Clear storage if data is invalid
					sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_POSTS_KEY);
					sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_CURSOR_KEY);
					sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_SORT_KEY);
				}
			} catch (err) {
				console.error(
					"CLIENT: Failed to parse library posts from sessionStorage. Clearing.",
					err
				);
				sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_POSTS_KEY);
				sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_CURSOR_KEY);
				sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_SORT_KEY);
			}
		} else {
			// If posts aren't in storage (possibly cleared by bookmark change),
			// but sort preference is available, use that sort and fetch posts
			if (storedSortValue && ["recent", "oldest"].includes(storedSortValue)) {
				const sortPref = storedSortValue as SortOption;
				setSort(sortPref);

				// Only fetch if the sort preference is different from initialSort
				if (sortPref !== initialSort) {
					// Fetch posts with the saved sort preference
					const fetchPosts = async () => {
						setLoading(true);
						try {
							const res = await fetch(
								`/api/v1/library?sort=${sortPref}&limit=10`
							);
							const json = await res.json();

							if (res.ok && Array.isArray(json.data)) {
								setPosts(json.data);
								setCursor(json.nextCursor);
							} else {
								console.error(
									"Failed to load library posts with saved sort",
									json
								);
							}
						} catch (err) {
							console.error(
								"Failed to load library posts with saved sort",
								err
							);
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
	}, [initialSort, initialPosts]);

	// Effect to save posts, cursor, and sort to sessionStorage when they change, only after hydration
	useEffect(() => {
		if (!hydrated) {
			// Don't save to sessionStorage until after hydration and initial load from storage is attempted.
			return;
		}
		if (typeof window !== "undefined") {
			try {
				sessionStorage.setItem(
					SESSION_STORAGE_LIBRARY_POSTS_KEY,
					JSON.stringify(posts)
				);
				sessionStorage.setItem(
					SESSION_STORAGE_LIBRARY_CURSOR_KEY,
					cursor ?? ""
				);
				sessionStorage.setItem(SESSION_STORAGE_LIBRARY_SORT_KEY, sort);
			} catch (err) {
				console.error(
					"CLIENT: Failed to save library posts/cursor/sort to sessionStorage",
					err
				);
			}
		}
	}, [posts, cursor, sort, hydrated]);
	// Effect to fetch the total bookmark count
	useEffect(() => {
		const fetchTotalCount = async () => {
			try {
				const res = await fetch(`/api/v1/library?limit=1&includeCount=true`);
				const json = await res.json();
				if (res.ok && json.totalCount !== undefined) {
					setTotalBookmarks(json.totalCount);
				}
			} catch (error) {
				console.error("Failed to fetch total bookmark count", error);
			}
		};

		if (hydrated) {
			fetchTotalCount();
		}
	}, [hydrated]);

	// Handle changing sort option
	const handleSortChange = async (newSort: SortOption) => {
		if (newSort === sort) return; // No change

		setLoading(true);
		try {
			// Reset posts list with new sort option
			const res = await fetch(
				`/api/v1/library?sort=${newSort}&limit=10&includeCount=true`
			);
			const json = await res.json();
			if (res.ok && Array.isArray(json.data)) {
				setPosts(json.data);
				setCursor(json.nextCursor);
				setSort(newSort);

				// Update total count if available
				if (json.totalCount !== undefined) {
					setTotalBookmarks(json.totalCount);
				}
			} else {
				console.error("Failed to load library posts with new sort", json);
			}
		} catch (err) {
			console.error("Failed to load library posts with new sort", err);
		} finally {
			setLoading(false);
		}
	};
	const loadMore = async () => {
		if (!cursor) return;

		setLoading(true);
		try {
			const res = await fetch(
				`/api/v1/library?cursor=${cursor}&limit=5&sort=${sort}&includeCount=true`
			);
			const json = await res.json();

			if (res.ok && Array.isArray(json.data)) {
				setPosts((prevPosts) => [...prevPosts, ...json.data]);
				setCursor(json.nextCursor);

				// Update total count if available
				if (json.totalCount !== undefined) {
					setTotalBookmarks(json.totalCount);
				}
			} else {
				console.error(
					"Failed to load more library posts or data format incorrect. Response:",
					json
				);
			}
		} catch (err) {
			console.error("Failed to load more library posts", err);
		} finally {
			setLoading(false);
		}
	};
	if (!hydrated) {
		// Render nothing or a placeholder until hydration is complete
		return (
			<div className="space-y-6 max-w-7xl mx-auto">
				<div className="flex justify-between mb-4">
					{/* We'll use the server-provided bookmark count since we're not hydrated yet */}
					<div className="flex items-center gap-2 bg-primary/5 rounded-full px-4 py-1.5 border border-primary/10">
						<span className="font-medium">{initialPosts.length}</span>
						<span className="text-muted-foreground">
							{initialPosts.length === 1 ? "saved post" : "saved posts"}
						</span>
					</div>
					<Button
						variant="outline"
						className="flex items-center gap-2"
						disabled>
						<CalendarDays className="h-4 w-4" />
						<span>{initialSort === "recent" ? "Recent" : "Oldest"}</span>
						<ChevronDown className="h-4 w-4 ml-1" />
					</Button>
				</div>
				{initialPosts.map((item, index) => (
					<div key={index} className="mb-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
							<Bookmark className="h-3.5 w-3.5" />
							<span>
								Bookmarked{" "}
								{formatDistanceToNow(new Date(item.bookmarkedAt), {
									addSuffix: true,
								})}
							</span>
						</div>
						<PostCard post={item.post} key={item.post.id} />
					</div>
				))}
			</div>
		);
	}
	return (
		<div className="space-y-6 max-w-7xl mx-auto">
			<div className="flex justify-between mb-4">
				{totalBookmarks !== null && (
					<div className="flex items-center gap-2 bg-primary/5 rounded-full px-4 py-1.5 border border-primary/10">
						<span className="font-medium">{totalBookmarks}</span>
						<span className="text-muted-foreground">
							{totalBookmarks === 1 ? "saved post" : "saved posts"}
						</span>
					</div>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="flex items-center gap-2">
							<CalendarDays className="h-4 w-4" />
							<span>{sort === "recent" ? "Recent" : "Oldest"}</span>
							<ChevronDown className="h-4 w-4 ml-1" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => handleSortChange("recent")}>
							Recent
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleSortChange("oldest")}>
							Oldest
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{posts.length === 0 ? (
				<div className="text-center py-20">
					<div className="inline-block p-4 bg-muted rounded-full mb-4">
						<Bookmark className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="text-xl font-medium mb-2">Your library is empty</h3>
					<p className="text-muted-foreground">
						You haven&apos;t bookmarked any posts yet. Go ahead and explore!
					</p>
				</div>
			) : (
				<>
					{posts.map((item) => (
						<div key={item.post.id} className="mb-4">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
								<Bookmark className="h-3.5 w-3.5" />
								<span>
									Bookmarked{" "}
									{formatDistanceToNow(new Date(item.bookmarkedAt), {
										addSuffix: true,
									})}
								</span>
							</div>
							<PostCard post={item.post} />
						</div>
					))}

					{cursor && (
						<div className="flex justify-center my-8">
							<Button
								variant="outline"
								onClick={loadMore}
								disabled={loading}
								className="min-w-[140px]">
								{loading ? "Loading..." : "Load More"}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
