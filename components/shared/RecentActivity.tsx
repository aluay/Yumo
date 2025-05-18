"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserActivities } from "@/lib/api/getUserActivities";
import { ActivityLog } from "@/lib/validation/post";
import SignInButton from "../auth/SignInButton";

export default function RecentActivity() {
	const { data: session } = useSession();
	const [activities, setActivities] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchActivities = async () => {
			if (!session?.user?.id) return;

			setLoading(true);
			setError(null);

			try {
				const response = await getUserActivities({ limit: 10 });
				setActivities(response.activities);
			} catch (err) {
				console.error("Failed to fetch activities:", err);
				setError("Failed to load activities");
			} finally {
				setLoading(false);
			}
		};

		fetchActivities();
	}, [session?.user?.id]);

	// Format timestamp to relative time
	const formatTimestamp = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
		} catch (err) {
			console.error("Error formatting timestamp:", err);
			return "Unknown time";
		}
	};
	// Get subtle background color based on activity type
	const getActivityStyle = (type: string) => {
		switch (type) {
			case "POST_CREATED":
				return {
					bg: "bg-green-500/5",
				};
			case "POST_LIKED":
				return {
					bg: "bg-red-500/5",
				};
			case "POST_BOOKMARKED":
				return {
					bg: "bg-blue-500/5",
				};
			case "COMMENT_POSTED":
				return {
					bg: "bg-yellow-500/5",
				};
			case "COMMENT_LIKED":
				return {
					bg: "bg-purple-500/5",
				};
			case "USER_FOLLOWED":
				return {
					bg: "bg-indigo-500/5",
				};
			default:
				return {
					bg: "bg-gray-500/5",
				};
		}
	};
	// Generate activity message
	const getActivityMessage = (activity: ActivityLog) => {
		const { type, Post } = activity;

		// Ensure post title isn't too long
		const formatTitle = (title: string | undefined) => {
			const postTitle = title || "Untitled";
			return postTitle;
		};

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

	// Get URL for the activity
	const getActivityUrl = (activity: ActivityLog) => {
		const { type, Post, targetId } = activity;

		if (Post) {
			if ("slug" in Post && Post.slug) {
				return `/posts/${Post.slug}`;
			}
			return `/posts/${Post.id}`;
		}

		if (type === "USER_FOLLOWED" && targetId) {
			return `/users/${targetId}`;
		}

		return "#";
	};
	// If no session, show welcome message
	if (!session?.user?.id) {
		return (
			<Card className="border h-full">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg font-medium flex items-center">
						<FileText className="h-4 w-4 mr-2" />
						Join Our Community
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-6 gap-5 text-center">
						<div className="space-y-3">
							<p className="text-sm font-medium leading-relaxed">
								Yumo is a creative space for developers, engineers, and curious
								minds to share insights, teach what they know, and explore ideas
								from others.
							</p>
							<p className="text-xs text-muted-foreground mt-2">
								Sign in to follow creators, teach, learn, and save the content
								that inspires you
							</p>
						</div>
						<div className="w-full">
							<SignInButton className="w-full pulse-animation shadow-sm" />
							<p className="text-xs text-muted-foreground mt-3 italic">
								Join our growing community of tech enthusiasts
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}
	return (
		<Card className="border h-full overflow-hidden flex flex-col">
			<CardHeader className="pb-3 flex-shrink-0">
				<CardTitle className="text-lg font-medium flex items-center">
					<FileText className="h-4 w-4 mr-2" />
					Recent Activity
				</CardTitle>
			</CardHeader>

			<CardContent className="overflow-y-auto flex-grow p-2">
				{loading && activities.length === 0 ? (
					<div className="flex justify-center items-center py-10">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : error ? (
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
												style.bg
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
