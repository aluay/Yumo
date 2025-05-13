import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Search result types
interface PostResult {
	id: number;
	title: string;
	tags: string[];
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

export default function SearchBar() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounce(query, 300);
	const [results, setResults] = useState<SearchResults>({
		posts: [],
		users: [],
		tags: [],
	});
	const inputRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
			setResults({
				posts: [],
				users: [],
				tags: [],
			});
			return;
		}

		setLoading(true);

		const fetchResults = async () => {
			try {
				const res = await fetch(
					`/api/v1/search?q=${encodeURIComponent(debouncedQuery)}&limit=3`
				);

				if (!res.ok) {
					throw new Error(`Error ${res.status}: ${res.statusText}`);
				}

				const data = await res.json();
				setResults(data);
			} catch (error) {
				console.error("Search error:", error);
				setResults({
					posts: [],
					users: [],
					tags: [],
				});
			} finally {
				setLoading(false);
			}
		};

		fetchResults();
	}, [debouncedQuery]);
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const hasResults =
		results.posts.length > 0 ||
		results.users.length > 0 ||
		results.tags.length > 0;

	return (
		<div ref={inputRef} className="relative w-full max-w-2xl mx-auto">
			{/* Input */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					className="pl-9"
					placeholder="Search posts, users, and tags..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" && query.trim()) {
							router.push(`/search?q=${encodeURIComponent(query)}`);
						}
					}}
				/>
				{loading && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground">
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
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
				)}
			</div>{" "}
			{/* Search Results Dropdown */}
			{open && debouncedQuery && debouncedQuery.length >= 2 && (
				<div className="absolute mt-2 w-full max-h-96 overflow-y-auto rounded-md border bg-background p-2 shadow-md overscroll-contain z-10">
					{loading ? (
						<div className="flex justify-center items-center p-4">
							<div className="h-4 w-4 animate-spin text-muted-foreground">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
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
					) : hasResults ? (
						<>
							{/* Posts */}
							{results.posts.length > 0 && (
								<div className="mb-4">
									<h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">
										Posts
									</h3>
									{results.posts.map((post) => (
										<Link
											href={`/posts/${post.id}`}
											key={post.id}
											className="block p-2 hover:bg-muted rounded-sm"
											onClick={() => setOpen(false)}>
											<div className="font-medium">{post.title}</div>
											{post.tags.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-1">
													{post.tags.slice(0, 3).map((tag) => (
														<Badge
															key={tag}
															variant="outline"
															className="text-xs">
															{tag}
														</Badge>
													))}
												</div>
											)}
										</Link>
									))}
								</div>
							)}

							{/* Users */}
							{results.users.length > 0 && (
								<div className="mb-4">
									<h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">
										Users
									</h3>
									{results.users.map((user) => (
										<Link
											href={`/users/${user.id}`}
											key={user.id}
											className="flex items-center p-2 hover:bg-muted rounded-sm"
											onClick={() => setOpen(false)}>
											<Avatar className="h-6 w-6 mr-2">
												<AvatarImage src={user.image} alt={user.name} />
												<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
											</Avatar>
											<span>{user.name}</span>
										</Link>
									))}
								</div>
							)}

							{/* Tags */}
							{results.tags.length > 0 && (
								<div className="mb-2">
									<h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">
										Tags
									</h3>
									<div className="flex flex-wrap gap-2 p-2">
										{results.tags.map((tag) => (
											<Link
												href={`/tags/${tag}`}
												key={tag}
												onClick={() => setOpen(false)}>
												<Badge variant="secondary" className="cursor-pointer">
													{tag}
												</Badge>
											</Link>
										))}
									</div>
								</div>
							)}

							{/* View all results */}
							<div className="pt-2 pb-1 border-t">
								<button
									onClick={() => {
										router.push(`/search?q=${encodeURIComponent(query)}`);
										setOpen(false);
									}}
									className="w-full text-center p-2 text-sm text-primary hover:bg-muted rounded-sm">
									View all results
								</button>
							</div>
						</>
					) : (
						<div className="p-4 text-center text-muted-foreground">
							No results found for &ldquo;{query}&rdquo;
						</div>
					)}
				</div>
			)}
		</div>
	);
}
