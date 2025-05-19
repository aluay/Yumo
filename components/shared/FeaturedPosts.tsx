import { getFeaturedPosts } from "@/lib/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Flame, Heart, MessageSquare } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function FeaturedPosts() {
	const posts = await getFeaturedPosts({ limit: 5 });

	return (
		<Card className="mb-6 overflow-hidden">
			<CardHeader className="pt-3 pb-3 mb-4 border-b">
				<CardTitle className="font-normal flex items-center text-base text-muted-foreground flex items-center gap-2">
					<Flame className="w-4 h-4 text-orange-500" />
					Featured Posts
				</CardTitle>
			</CardHeader>
			<CardContent className="px-6 pb-6 pt-0">
				{posts.length === 0 ? (
					<div className="text-center py-4 text-muted-foreground">
						No featured posts available
					</div>
				) : (
					<div className="space-y-4">
						{posts.map((post) => {
							const postUrl = post.slug
								? `/posts/${post.id}-${post.slug}`
								: `/posts/${post.id}`;
							return (
								<div
									key={post.id}
									className="group rounded-md p-2 -mx-2 hover:bg-primary/5 transition-colors duration-200">
									<Link href={postUrl} className="block">
										<div className="space-y-2">
											<h3 className="line-clamp-2 font-medium group-hover:text-primary transition-colors">
												{post.title}
											</h3>
											<p className="text-xs text-muted-foreground hover:text-foreground transition-colors">
												{post.author.name}
											</p>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3 text-xs text-muted-foreground">
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
																className="text-[0.65rem] px-1 py-0 h-auto">
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
