"use client";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/layouts/PageLayout";

// Search result types
interface PostResult {
	id: number;
	title: string;
	tags: string[];
	likeCount: number;
	bookmarkCount: number;
	createdAt: string | Date;
}

interface UserResult {
	id: number;
	name: string;
	image: string;
}

interface SearchResults {
	posts: PostResult[];
	users: UserResult[];
	tags: string[];
}

export default function SearchPage() {
	const searchParams = useSearchParams();
	const initialQuery = searchParams.get("q") || "";

	const [query, setQuery] = useState(initialQuery);
	const [debouncedQuery] = useDebounce(query, 300);
	const [results, setResults] = useState<SearchResults>({
		posts: [],
		users: [],
		tags: [],
	});
	const [loading, setLoading] = useState(false);

	// Effect for search input changes
	useEffect(() => {
		if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
			setResults({ posts: [], users: [], tags: [] });
			return;
		}
		fetchSearchResults(debouncedQuery);
	}, [debouncedQuery]);

	const fetchSearchResults = async (searchQuery: string) => {
		setLoading(true);
		try {
			const res = await fetch(
				`/api/v1/search?q=${encodeURIComponent(searchQuery)}&limit=10`
			);

			if (!res.ok) {
				throw new Error(`Error ${res.status}: ${res.statusText}`);
			}

			const data = await res.json();
			setResults(data);
		} catch (error) {
			console.error("Search error:", error);
			setResults({ posts: [], users: [], tags: [] });
		} finally {
			setLoading(false);
		}
	};

	// Helper to format date
	const formatDate = (dateString: string | Date) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	return (
		<PageLayout>
			<div className="max-w-4xl mx-auto px-4">
				{/* Search Input */}
				<div className="relative mb-8">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
					<Input
						className="pl-10 py-6 text-lg"
						placeholder="Search posts, users, and tags..."
						value={query}
						onChange={(e) => {
							const newValue = e.target.value;
							setQuery(newValue);

							// Update URL with new query
							if (typeof window !== "undefined") {
								const url = new URL(window.location.href);
								url.searchParams.set("q", newValue);
								window.history.pushState({}, "", url);
							}
						}}
					/>
				</div>

				{/* Search Results */}
				{debouncedQuery && debouncedQuery.length >= 2 && (
					<div className="mt-4">
						{loading ? (
							<div className="flex justify-center items-center p-8">
								<div className="h-8 w-8 animate-spin text-muted-foreground">
									<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8v8z"
										/>
									</svg>
								</div>
							</div>
						) : (
							<div className="space-y-10">
								{/* Posts Section */}
								<div>
									<h2 className="text-2xl font-bold mb-4 border-b pb-2">
										Posts
									</h2>
									{results.posts.length > 0 ? (
										<div className="space-y-4">
											{results.posts.slice(0, 5).map((post) => (
												<Link
													href={`/posts/${post.id}`}
													key={post.id}
													className="block p-4 hover:bg-muted rounded-md transition-colors">
													<div className="font-medium text-lg">
														{post.title}
													</div>
													<div className="flex items-center text-sm text-muted-foreground mt-2">
														<span className="mr-4">
															{formatDate(post.createdAt)}
														</span>
														<span className="mr-4">❤️ {post.likeCount}</span>
														<span>🔖 {post.bookmarkCount}</span>
													</div>
													{post.tags.length > 0 && (
														<div className="flex flex-wrap gap-2 mt-3">
															{post.tags.map((tag) => (
																<Badge key={tag} variant="outline">
																	{tag}
																</Badge>
															))}
														</div>
													)}
												</Link>
											))}
										</div>
									) : (
										<div className="text-center text-muted-foreground p-4">
											No posts found matching &ldquo;{query}&rdquo;
										</div>
									)}
								</div>

								{/* Users Section */}
								<div>
									<h2 className="text-2xl font-bold mb-4 border-b pb-2">
										Users
									</h2>
									{results.users.length > 0 ? (
										<div className="space-y-4">
											{results.users.slice(0, 5).map((user) => (
												<Link
													href={`/users/${user.id}`}
													key={user.id}
													className="flex items-center p-4 hover:bg-muted rounded-md transition-colors">
													<Avatar className="h-12 w-12 mr-4">
														<AvatarImage src={user.image} alt={user.name} />
														<AvatarFallback>
															{user.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<span className="font-medium text-lg">
														{user.name}
													</span>
												</Link>
											))}
										</div>
									) : (
										<div className="text-center text-muted-foreground p-4">
											No users found matching &ldquo;{query}&rdquo;
										</div>
									)}
								</div>

								{/* Tags Section */}
								<div>
									<h2 className="text-2xl font-bold mb-4 border-b pb-2">
										Tags
									</h2>
									{results.tags.length > 0 ? (
										<div className="flex flex-wrap gap-3 p-4">
											{results.tags.slice(0, 5).map((tag) => (
												<Link href={`/tags/${tag}`} key={tag}>
													<Badge
														variant="secondary"
														className="cursor-pointer text-base px-4 py-2">
														{tag}
													</Badge>
												</Link>
											))}
										</div>
									) : (
										<div className="text-center text-muted-foreground p-4">
											No tags found matching &ldquo;{query}&rdquo;
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				)}

				{/* No results message */}
				{!loading &&
					debouncedQuery &&
					debouncedQuery.length >= 2 &&
					results.posts.length === 0 &&
					results.users.length === 0 &&
					results.tags.length === 0 && (
						<div className="text-center p-10 text-lg text-muted-foreground">
							No results found for &ldquo;{debouncedQuery}&rdquo;
						</div>
					)}
			</div>
		</PageLayout>
	);
}
