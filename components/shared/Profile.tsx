"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "@/lib/api/api";
import { UserProfile } from "@/lib/schemas/scriptSchema";
// import { format } from "date-fns";
// import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import moment from "moment";

export function Profile() {
	const { data: session } = useSession();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	// const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!session?.user?.id) return;

		getUserProfile(Number(session.user.id))
			.then(setProfile)
			.catch((err) => console.error("Failed to load profile", err));
		// .finally(() => setLoading(false));
	}, [session?.user?.id]);

	// if (loading || !profile) {
	// 	return (
	// 		<div className="space-y-4">
	// 			<Skeleton className="h-16 w-16 rounded-full" />
	// 			<Skeleton className="h-4 w-48" />
	// 			<Skeleton className="h-4 w-32" />
	// 			<Skeleton className="h-4 w-24" />
	// 		</div>
	// 	);
	// }

	return (
		<div className="space-y-4">
			<Avatar className="h-16 w-16">
				<AvatarImage
					src={profile?.image || undefined}
					alt={profile?.name || "User"}
				/>
				<AvatarFallback>{profile?.name?.charAt(0) ?? "U"}</AvatarFallback>
			</Avatar>

			<div>
				<p className="text-lg font-semibold">Name: {profile?.name}</p>
				<p className="text-sm text-muted-foreground">Email: {profile?.email}</p>
			</div>

			<p className="text-sm text-muted-foreground">
				Date joined: {moment(profile?.createdAt).format("MM/DD/YYYY")}
			</p>

			<div className="text-sm text-muted-foreground">
				<p>You have shared: {profile?.scriptCount} scripts</p>
				<p>You have bookmarked: {profile?.bookmarkCount} bookmarks</p>
			</div>
		</div>
	);
}
