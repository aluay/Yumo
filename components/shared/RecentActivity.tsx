import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { getUserActivities } from "@/lib/api/api";
import JoinCommunityCard from "./JoinCommunityCard";
import { ActivityLog } from "@/lib/validation/post";

export default async function RecentActivity() {
	const session = await auth();
	if (!session?.user?.id) {
		return <JoinCommunityCard />;
	}

	let activities: ActivityLog[] = [];
	let error: string | null = null;
	try {
		const response = await getUserActivities({
			userId: Number(session.user.id),
			limit: 10,
		});
		activities = response.activities.map((activity) => ({
			...activity,
			createdAt: new Date(activity.createdAt),
		}));
	} catch {
		error = "Failed to load activities";
	}

	const formatTimestamp = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
		} catch {
			return "Unknown time";
		}
	};

	const getActivityMessage = (activity: ActivityLog) => {
		const { type, Post } = activity;
		const formatTitle = (title?: string) => title || "Untitled";
		switch (type) {
			case "POST_CREATED":
				return `You created a new post "${formatTitle(Post?.title)}"`;
			case "POST_LIKED":
				return `You liked "${formatTitle(Post?.title)}"`;
			case "POST_BOOKMARKED":
				return `You bookmarked "${formatTitle(Post?.title)}"`;
			case "COMMENT_POSTED":
				return `You commented on "${formatTitle(Post?.title)}"`;
			case "COMMENT_LIKED":
				return `You liked a comment on "${formatTitle(Post?.title)}"`;
			case "USER_FOLLOWED":
				return "You followed a user";
			default:
				return activity.message || "You performed an action";
		}
	};

	const getActivityUrl = (activity: ActivityLog) => {
		const { type, Post, targetId } = activity;
		if (Post) {
			// Post may or may not have a slug
			const postWithSlug = Post as { id: number; title: string; slug?: string };
			if (postWithSlug.slug) {
				return `/posts/${postWithSlug.slug}`;
			}
			return `/posts/${postWithSlug.id}`;
		}
		if (type === "USER_FOLLOWED" && targetId) {
			return `/users/${targetId}`;
		}
		return "#";
	};

	return (
		<Card className="mb-4 overflow-hidden border-muted">
			<CardHeader className="pt-2 pb-2 mb-2 border-b border-muted">
				<CardTitle className="font-normal flex items-center text-sm text-muted-foreground gap-2">
					<Timer className="w-4 h-4 text-purple-500" />
					<span className="tracking-tight">Recent Activity</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="px-3 pb-3 pt-0">
				{error ? (
					<div className="text-center text-xs text-red-500 py-2">{error}</div>
				) : activities.length > 0 ? (
					<div className="space-y-2">
						{activities.map((activity) => {
							const message = getActivityMessage(activity);
							const url = getActivityUrl(activity);
							return (
								<div
									key={activity.id}
									className="group rounded p-1 -mx-1 hover:bg-primary/5 transition-colors duration-200">
									<Link href={url} className="block">
										<div className="space-y-1 p-2">
											<p className="line-clamp-2 font-normal text-xs group-hover:text-primary/80 transition-colors">
												{message}
											</p>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
													<span className="flex items-center gap-1">
														<Timer className="h-3 w-3" />
														{formatTimestamp(activity.createdAt.toString())}
													</span>
												</div>
											</div>
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-2 text-xs text-muted-foreground">
						No recent activity found
					</div>
				)}
			</CardContent>
		</Card>
	);
}
