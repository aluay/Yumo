"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "@/lib/api/api";
import { UserProfileInterface } from "@/lib/schemas/postSchema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";

interface UserProfileProps {
	userId: number;
}

export function UserProfile(userId: UserProfileProps) {
	const [profile, setProfile] = useState<UserProfileInterface | null>(null);

	useEffect(() => {
		getUserProfile(Number(userId.userId))
			.then(setProfile)
			.catch((err) => console.error("Failed to load profile", err));
	}, [userId]);

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
				<p>You have shared: {profile?.postCount} posts</p>
				<p>You have bookmarked: {profile?.bookmarkCount} bookmarks</p>
			</div>
		</div>
	);
}
