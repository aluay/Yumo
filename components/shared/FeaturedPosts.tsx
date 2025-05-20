import { getFeaturedPosts } from "@/lib/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Flame, Heart, MessageSquare } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function FeaturedPosts() {
	const posts = await getFeaturedPosts({ limit: 5 });

	return (
		<Card className="mb-4 overflow-hidden border-muted">
			<CardHeader className="pt-2 pb-2 mb-2 border-b border-muted">
				<CardTitle className="font-normal flex items-center text-sm text-muted-foreground gap-2">
					<Flame className="w-4 h-4 text-orange-500" />
					<span className="tracking-tight">Featured Posts</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="px-3 pb-3 pt-0">
				{posts.length === 0 ? (
					<div className="text-center py-2 text-xs text-muted-foreground">
						No featured posts available
					</div>
				) : (
					<div className="space-y-2">
						{posts.map((post) => {
							const postUrl = post.slug
								? `/posts/${post.id}-${post.slug}`
								: `/posts/${post.id}`;
							return (
								<div
									key={post.id}
									className="group rounded p-1 -mx-1 hover:bg-primary/5 transition-colors duration-200">
									<Link href={postUrl} className="block">
										<div className="space-y-1 p-2">
											{" "}
											<h3 className="line-clamp-2 font-normal text-xs group-hover:text-primary/80 transition-colors">
												{post.title}
											</h3>
											{post.category && (
												<div className="flex items-center my-0.5">
													<Badge
														variant="outline"
														className="text-[0.6rem] px-1 py-0 h-auto border-muted-foreground/30 text-muted-foreground/80">
														{post.category.charAt(0) +
															post.category.slice(1).toLowerCase()}
													</Badge>
												</div>
											)}
											<p className="text-[11px] text-muted-foreground/80 hover:text-foreground transition-colors">
												{post.author.name}
											</p>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
													<span className="flex items-center gap-1">
														<Heart className="h-3 w-3" />
														{formatNumber(post.likeCount)}
													</span>
													<span className="flex items-center gap-1">
														<MessageSquare className="h-3 w-3" />
														{formatNumber(post.commentCount)}
													</span>
												</div>
												{post.tags && post.tags.length > 0 && (
													<div className="flex gap-1">
														{post.tags.map((tag) => (
															<Badge
																key={tag}
																variant="outline"
																className="text-[0.6rem] px-1 py-0 h-auto border-muted-foreground/30 text-muted-foreground/80">
																{tag}
															</Badge>
														))}
													</div>
												)}
											</div>
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
