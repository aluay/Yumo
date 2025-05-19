"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LibraryPostPayload } from "@/lib/validation/post";
import {
	Bookmark,
	ChevronDown,
	CalendarDays,
	Hash,
	ArrowDownUp,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { MiniPostCard } from "@/components/shared/MiniPostCard";

type SortOption = "recent" | "oldest";

const SESSION_STORAGE_LIBRARY_POSTS_KEY = "library_posts";
const SESSION_STORAGE_LIBRARY_SORT_KEY = "library_sort";
const SESSION_STORAGE_LIBRARY_SELECTED_TAGS_KEY = "library_selected_tags";

interface BookmarkedPost {
	post: LibraryPostPayload;
	bookmarkedAt: string;
}

interface LibraryPostsListProps {
	initialPosts: BookmarkedPost[];
	initialSort?: SortOption;
}

export default function LibraryPostsList({
	initialPosts,
	initialSort = "recent",
}: LibraryPostsListProps) {
	const [posts, setPosts] = useState<BookmarkedPost[]>(initialPosts);
	const [sort, setSort] = useState<SortOption>(initialSort);
	const [hydrated, setHydrated] = useState(false);
	const [totalBookmarks, setTotalBookmarks] = useState<number | null>(null);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Extract unique tags from all posts
	const uniqueTags = useMemo(() => {
		const tagSet = new Set<string>();
		posts.forEach((bookmarkedPost) => {
			bookmarkedPost.post.tags?.forEach((tag) => tagSet.add(tag));
		});
		return Array.from(tagSet).sort();
	}, [posts]);

	// Filter posts based on selected tags
	const filteredPosts = useMemo(() => {
		if (selectedTags.length === 0) return posts;
		return posts.filter((bookmarkedPost) =>
			selectedTags.every((tag) => bookmarkedPost.post.tags?.includes(tag))
		);
	}, [posts, selectedTags]);

	// Handle tag selection
	const toggleTag = useCallback((tag: string) => {
		setSelectedTags((prev) => {
			const newTags = prev.includes(tag)
				? prev.filter((t) => t !== tag)
				: [...prev, tag];
			// Save to session storage
			sessionStorage.setItem(
				SESSION_STORAGE_LIBRARY_SELECTED_TAGS_KEY,
				JSON.stringify(newTags)
			);
			return newTags;
		});
	}, []);

	// Load selected tags from session storage on mount
	useEffect(() => {
		const storedTags = sessionStorage.getItem(
			SESSION_STORAGE_LIBRARY_SELECTED_TAGS_KEY
		);
		if (storedTags) {
			try {
				const parsedTags = JSON.parse(storedTags);
				if (Array.isArray(parsedTags)) {
					setSelectedTags(parsedTags);
				}
			} catch (err) {
				console.error("Failed to parse stored tags", err);
			}
		}
	}, []);

	// Effect for hydration and loading from sessionStorage (runs once on client mount)
	useEffect(() => {
		setHydrated(true); // Mark that hydration has occurred

		const storedPostsJson = sessionStorage.getItem(
			SESSION_STORAGE_LIBRARY_POSTS_KEY
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
					sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_SORT_KEY);
				}
			} catch (err) {
				console.error(
					"CLIENT: Failed to parse library posts from sessionStorage. Clearing.",
					err
				);
				sessionStorage.removeItem(SESSION_STORAGE_LIBRARY_POSTS_KEY);
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
						try {
							const res = await fetch(
								`/api/v1/library?sort=${sortPref}&limit=10`
							);
							const json = await res.json();

							if (res.ok && Array.isArray(json.data)) {
								setPosts(json.data);
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

	// Effect to save posts and sort to sessionStorage when they change, only after hydration
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
				sessionStorage.setItem(SESSION_STORAGE_LIBRARY_SORT_KEY, sort);
			} catch (err) {
				console.error(
					"CLIENT: Failed to save library posts/cursor/sort to sessionStorage",
					err
				);
			}
		}
	}, [posts, sort, hydrated]);
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

		try {
			// Reset posts list with new sort option
			const res = await fetch(
				`/api/v1/library?sort=${newSort}&limit=10&includeCount=true`
			);
			const json = await res.json();
			if (res.ok && Array.isArray(json.data)) {
				setPosts(json.data);
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
						<MiniPostCard post={item.post} bookmarkedAt={item.bookmarkedAt} />
					</div>
				))}
			</div>
		);
	}
	return (
		<div className="space-y-6 max-w-7xl mx-auto">
			{/* Responsive Tags Container */}
			<div className="lg:hidden mb-4">
				<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="w-full flex items-center justify-between">
							<span>
								Filter by Tags{" "}
								{selectedTags.length > 0 && `(${selectedTags.length})`}
							</span>
							<ChevronDown className="h-4 w-4 ml-2" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-full max-h-[300px] overflow-y-auto">
						{uniqueTags.map((tag) => (
							<DropdownMenuItem
								key={tag}
								onClick={() => toggleTag(tag)}
								className="flex items-center gap-2">
								<Badge
									variant="outline"
									className={`flex items-center gap-1 cursor-pointer hover:bg-primary/10 transition-colors ${
										selectedTags.includes(tag)
											? "border-primary/30 text-primary bg-primary/5"
											: ""
									}`}>
									<Hash className="h-3 w-3" /> {tag}
								</Badge>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex gap-6">
				{/* Desktop Tags Sidebar */}
				<div className="hidden lg:block w-48 shrink-0">
					<div className="sticky top-4">
						<h3 className="font-semibold mb-3">Filter by Tags</h3>
						<div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
							{uniqueTags.map((tag) => (
								<button
									key={tag}
									onClick={() => toggleTag(tag)}
									className="block w-full text-left">
									<Badge
										variant="outline"
										className={`flex items-center gap-1 w-full cursor-pointer hover:bg-primary/10 transition-colors ${
											selectedTags.includes(tag)
												? "border-primary/30 text-primary bg-primary/5"
												: ""
										}`}>
										<Hash className="h-3 w-3" /> {tag}
									</Badge>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Posts List */}
				<div className="flex-1">
					<div>
						<div className="flex items-center justify-between mb-6">
							<div className="text-sm text-muted-foreground">
								{totalBookmarks !== null
									? `${totalBookmarks} Bookmark${
											totalBookmarks !== 1 ? "s" : ""
									  }`
									: "Loading..."}
							</div>

							{/* Sort dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="flex items-center gap-2">
										<ArrowDownUp className="h-4 w-4" />
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

						<div className="grid gap-4">
							{filteredPosts.length === 0 ? (
								<p className="text-center py-8 text-muted-foreground">
									{selectedTags.length > 0
										? "No bookmarks found with the selected tags."
										: "No bookmarks yet."}
								</p>
							) : (
								filteredPosts.map(({ post, bookmarkedAt }) => (
									<div key={post.id} className="mb-4">
										<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
											<Bookmark className="h-3.5 w-3.5" />
											<span>
												Bookmarked{" "}
												{formatDistanceToNow(new Date(bookmarkedAt), {
													addSuffix: true,
												})}
											</span>
										</div>
										<MiniPostCard
											key={post.id}
											post={{
												id: post.id,
												title: post.title,
												tags: post.tags || [],
												createdAt: post.createdAt,
												author: {
													id: post.author.id,
													name: post.author.name,
													image: post.author.image,
												},
												slug: post.slug || "",
											}}
											bookmarkedAt={bookmarkedAt}
										/>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
