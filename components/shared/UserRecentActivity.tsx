"use client";

import { useEffect, useState } from "react";
import { getUserActivity } from "@/lib/api/api";
import { ActivityLog } from "@/lib/schemas/scriptSchema";
import moment from "moment";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { getActivityStyle } from "@/lib/utils";
import Link from "next/link";

interface UserRecentActivityProps {
	userId: number;
}

export default function UserRecentActivity(userId: UserRecentActivityProps) {
	const [activity, setActivity] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const data = await getUserActivity(Number(userId.userId));
				console.log(data);
				setActivity(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [userId]);

	if (loading) return <p className="text-muted-foreground">Loading...</p>;

	if (activity.length === 0) {
		return (
			<div className="text-center py-20">
				<h2 className="text-lg font-semibold">No recent activity</h2>
				<p className="text-sm text-muted-foreground mt-2">
					Your activity will show up here.
				</p>
			</div>
		);
	}

	return (
		<div className="flex  flex-col gap-2">
			{activity.map((entry) => {
				const { icon: Icon, text } = getActivityStyle(entry.type);

				return (
					<Link key={entry.id} href={`/script/${entry.script?.id}`}>
						<Card className="hover:bg-muted">
							<CardContent className="flex items-start gap-4 p-4">
								<Icon className={cn("h-5 w-5 mt-1", text)} />
								<div className="flex-1">
									<p className={cn("text-sm", text)}>{entry.message}</p>
									<p className="text-xs mt-1">
										{entry.script?.title} - {entry.script?.language}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{moment(entry.createdAt).fromNow()}
									</p>
								</div>
							</CardContent>
						</Card>
					</Link>
				);
			})}
		</div>
	);
}
