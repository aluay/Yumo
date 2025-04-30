"use client";

import { useEffect, useState } from "react";
import { getUserActivity } from "@/lib/api/api";
import { ActivityLog } from "@/lib/schemas/scriptSchema";
import moment from "moment";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { getActivityStyle } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function RecentActivity() {
	const [activity, setActivity] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(true);
	const { data: session } = useSession();

	useEffect(() => {
		async function load() {
			try {
				const data = await getUserActivity(Number(session?.user.id));
				setActivity(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [session?.user.id]);

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
		<div className="space-y-4">
			{activity.map((entry) => {
				const { icon: Icon, text } = getActivityStyle(entry.type);

				return (
					<Card key={entry.id}>
						<CardContent className="flex items-start gap-4 p-4">
							<Icon className={cn("h-5 w-5 mt-1", text)} />
							<div className="flex-1">
								<p className={cn("text-sm", text)}>{entry.message}</p>
								<p className="text-xs text-muted-foreground mt-1">
									{moment(entry.createdAt).fromNow()}
								</p>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
