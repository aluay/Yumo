import PageLayout from "@/components/layouts/PageLayout";
import FollowTagButton from "@/components/shared/FollowTagButton";
import { getTopTags } from "@/lib/api/api";
import Link from "next/link";
import { Search, TrendingUp, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function TagsPage() {
	const session = { user: { id: 1 } };
	const tags = await getTopTags(20, session); // Fetch top 20 tags from the API

	// Group tags by category (simple simulation for display purposes)
	const popularTags = tags.slice(0, 6);
	const recentTags = tags.slice(6, 12);
	const otherTags = tags.slice(12);

	return (
		<PageLayout>
			<div className="max-w-7xl mx-auto">
				{/* Hero Header Section with visual impact */}
				<div className="mb-16 relative">
					<div className="absolute inset-0 bg-gradient-to-r from-accent/40 via-background/10 to-primary/5 blur-3xl -z-10 opacity-80 rounded-3xl"></div>
					<div className="text-center py-14 px-4 relative">
						<div className="flex items-center justify-center mb-4">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 backdrop-blur-sm shadow-inner">
								<Hash className="w-8 h-8 text-primary" />
							</div>
						</div>
						<h1 className="gradient-text text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
							Explore Tags
						</h1>
						<p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
							Discover communities and topics that match your interests, follow
							to personalize your feed.
						</p>
						{/* Enhanced Search Bar with visual focus effects and keyboard shortcut */}
						<div className="relative max-w-md mx-auto tag-search-field">
							<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
								<Search className="h-5 w-5 text-muted-foreground" />
							</div>
							<Input
								type="text"
								placeholder="Search tags..."
								className="pl-10 pr-16 py-6 bg-background/80 backdrop-blur-sm border-muted shadow-sm rounded-xl"
							/>
							<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
								<kbd className="inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border">
									/
								</kbd>
							</div>
						</div>
					</div>
				</div>

				{/* Popular Tags Section with improved visual hierarchy */}
				<div className="mb-12">
					<div className="flex items-center gap-2 mb-6 border-b pb-2">
						<TrendingUp className="w-5 h-5 text-primary" />
						<h2 className="text-2xl font-bold">Popular Tags</h2>
					</div>
					<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
						{popularTags.map((tag) => (
							<div key={tag.name} className="tag-card group">
								<div className="flex flex-col w-full min-w-0 bg-card border border-border/40 p-5 rounded-xl hover:shadow-md transition-all duration-200 ease-in-out relative overflow-hidden">
									{/* Tag color indicator with gradient */}
									<div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary/20 to-primary/50"></div>

									{/* Hover effect background */}
									<div className="tag-hover-effect"></div>

									{/* Card content with improved layout */}
									<div className="pl-3 relative z-10">
										<div className="flex justify-between items-start mb-4">
											<Link
												href={`/tags/${encodeURIComponent(tag.name)}`}
												className="text-xl font-semibold group-hover:text-primary transition-colors duration-200 truncate">
												#{tag.name}
											</Link>

											<div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary/20">
												{tag.postCount} post{tag.postCount !== 1 ? "s" : ""}
											</div>
										</div>

										{/* Activity indicator with visual cues */}
										<div className="mt-4 flex items-center justify-between">
											<div className="flex items-center gap-1.5">
												<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
												<span className="text-xs text-muted-foreground">
													Active community
												</span>
											</div>

											<FollowTagButton
												tag={tag.name}
												initialIsFollowing={tag.isFollowing}
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Recent Activity Section */}
				<div className="mb-12">
					<div className="flex items-center gap-2 mb-6 border-b pb-2">
						<Hash className="w-5 h-5 text-primary" />
						<h2 className="text-2xl font-bold">Recent Activity</h2>
					</div>
					<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
						{recentTags.map((tag) => (
							<div key={tag.name} className="tag-card group">
								<div className="flex flex-col w-full min-w-0 bg-card border border-border/40 p-5 rounded-xl hover:shadow-md transition-all duration-200 ease-in-out relative overflow-hidden">
									{/* Different color indicator for recent tags */}
									<div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-300/30 to-blue-500/50 dark:from-blue-500/30 dark:to-blue-700/50"></div>

									{/* Blue tinted hover effect */}
									<div className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-t from-blue-500/5 to-transparent transition-all duration-300 group-hover:h-full"></div>

									<div className="pl-3 relative z-10">
										<div className="flex justify-between items-start mb-4">
											<Link
												href={`/tags/${encodeURIComponent(tag.name)}`}
												className="text-xl font-semibold group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
												#{tag.name}
											</Link>

											<div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300 transition-all duration-200 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
												{tag.postCount} post{tag.postCount !== 1 ? "s" : ""}
											</div>
										</div>

										<div className="mt-4 flex items-center justify-between">
											<div className="flex items-center gap-1.5">
												<div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-subtle"></div>
												<span className="text-xs text-muted-foreground">
													New discussions
												</span>
											</div>

											<FollowTagButton
												tag={tag.name}
												initialIsFollowing={tag.isFollowing}
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				{/* Browse More Tags Section - compact grid layout with improved visual presentation */}
				{otherTags.length > 0 && (
					<div className="mb-16">
						<div className="flex items-center justify-between mb-6 border-b pb-2">
							<div className="flex items-center gap-2">
								<Hash className="w-5 h-5 text-muted-foreground" />
								<h2 className="text-2xl font-bold">Browse More</h2>
							</div>
							<Link
								href="/tags/all"
								className="text-sm text-primary hover:text-primary/80 hover:underline transition-all duration-200 flex items-center gap-1">
								View all tags
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="lucide lucide-arrow-right">
									<path d="M5 12h14" />
									<path d="m12 5 7 7-7 7" />
								</svg>
							</Link>
						</div>
						<div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
							{otherTags.map((tag) => (
								<div key={tag.name} className="tag-card group">
									<div className="flex flex-col w-full min-w-0 bg-card/50 hover:bg-card border border-border/20 hover:border-border/40 p-3 rounded-lg hover:shadow-sm transition-all duration-200 ease-in-out">
										<div className="flex justify-between items-center mb-2">
											<Link
												href={`/tags/${encodeURIComponent(tag.name)}`}
												className="text-sm font-medium group-hover:text-primary transition-colors duration-200 truncate">
												#{tag.name}
											</Link>
										</div>
										<div className="flex items-center justify-between">
											<div className="text-xs text-muted-foreground">
												{tag.postCount} post{tag.postCount !== 1 ? "s" : ""}
											</div>
											<div className="w-1.5 h-1.5 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
										</div>
									</div>
								</div>
							))}
						</div>
						<div className="mt-8 flex justify-center">
							<button className="text-sm bg-background hover:bg-accent px-4 py-2 rounded-lg border border-border/30 hover:border-border/60 transition-colors duration-200 inline-flex items-center gap-2 group">
								<span>Load more tags</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="group-hover:translate-y-0.5 transition-transform duration-200">
									<path d="m6 9 6 6 6-6" />
								</svg>
							</button>
						</div>
					</div>
				)}
			</div>
		</PageLayout>
	);
}
