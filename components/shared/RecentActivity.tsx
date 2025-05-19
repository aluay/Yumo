import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
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

	const getActivityStyle = (type: ActivityLog["type"]) => {
		switch (type) {
			case "POST_CREATED":
				return {
					gradient: "bg-gradient-to-r from-green-500/5 to-emerald-500/3",
				};
			case "POST_LIKED":
				return { gradient: "bg-gradient-to-r from-red-500/5 to-pink-500/3" };
			case "POST_BOOKMARKED":
				return { gradient: "bg-gradient-to-r from-blue-500/5 to-cyan-500/3" };
			case "COMMENT_POSTED":
				return {
					gradient: "bg-gradient-to-r from-yellow-500/5 to-amber-500/3",
				};
			case "COMMENT_LIKED":
				return {
					gradient: "bg-gradient-to-r from-purple-500/5 to-fuchsia-500/3",
				};
			case "USER_FOLLOWED":
				return {
					gradient: "bg-gradient-to-r from-indigo-500/5 to-violet-500/3",
				};
			default:
				return { gradient: "bg-gradient-to-r from-gray-500/5 to-slate-500/3" };
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
		<Card className="border h-full overflow-hidden flex flex-col">
			<CardHeader className="pt-3 pb-3 mb-4 border-b">
				<CardTitle className="font-normal flex items-center text-base text-muted-foreground flex items-center gap-2">
					<Timer className="w-4 h-4 text-purple-500" />
					Recent Activity
				</CardTitle>
			</CardHeader>
			<CardContent className="overflow-y-auto flex-grow p-2">
				{error ? (
					<div className="text-center text-red-500 py-6">{error}</div>
				) : activities.length > 0 ? (
					<div className="space-y-2">
						{activities.map((activity) => {
							const style = getActivityStyle(activity.type);
							const message = getActivityMessage(activity);
							const url = getActivityUrl(activity);
							return (
								<div key={activity.id} className="group relative w-full">
									<Link href={url} className="w-full block">
										<div
											className={cn(
												"flex flex-col items-start gap-3 p-3 rounded-md transition-colors w-full",
												"hover:bg-accent/50 cursor-pointer border border-transparent hover:border-border",
												style.gradient
											)}>
											<p className="text-sm font-medium break-words hyphens-auto overflow-wrap-anywhere">
												{message}
											</p>
											<div className="flex flex-wrap items-center gap-2 mt-1">
												<span className="text-xs text-muted-foreground flex-shrink-0">
													{formatTimestamp(activity.createdAt.toString())}
												</span>
											</div>
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
						<FileText className="h-12 w-12 mb-4 opacity-50" />
						<p>No recent activity found</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
