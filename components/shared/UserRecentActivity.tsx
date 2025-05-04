"use client";

import { useEffect, useState } from "react";
import { getUserActivity } from "@/lib/api/api";
import { ActivityLog } from "@/lib/schemas/scriptSchema";
import moment from "moment";
// import { cn } from "@/lib/utils";
import { getActivityStyle } from "@/lib/utils";
import Link from "next/link";
import { getActivityMessage } from "@/lib/api/logActivity";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserRecentActivityProps {
	userId: number;
}

export default function UserRecentActivity(userId: UserRecentActivityProps) {
	const [activities, setActivities] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const data = await getUserActivity(Number(userId.userId));
				setActivities(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [userId]);

	if (loading) return <p className="text-muted-foreground">Loading...</p>;

	if (activities.length === 0) {
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
		<>
			<h2 className="scroll-m-20 py-2 text-3xl font-semibold tracking-tight first:mt-0">
				Recent Activity
			</h2>
			{activities.map((activity) => {
				const { icon: Icon, text } = getActivityStyle(activity.type);

				return (
					<Link key={activity.id} href={`/script/${activity.script?.id}`}>
						<Alert className={`hover:bg-muted/50 ${text}`}>
							<Icon className="h-5 w-5" />
							<AlertTitle>{getActivityMessage(activity)}</AlertTitle>
							<AlertDescription className="text-xs text-muted-foreground">
								{moment(activity.createdAt).fromNow()}
							</AlertDescription>
						</Alert>
					</Link>
				);
			})}
		</>
	);
}
