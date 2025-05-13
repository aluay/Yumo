// "use client";

// import { useEffect, useState } from "react";
// import { getUserProfile } from "@/lib/api/api";
// import { UserProfileInterface } from "@/lib/validation/post";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { format } from "date-fns";
// import { CalendarDays } from "lucide-react";
// import RichContentViewer from "./RichContentViewer";
// import { JSONContent } from "novel";

// interface UserProfileProps {
// 	userId: number;
// }

// export function UserProfile(userId: UserProfileProps) {
// 	const [profile, setProfile] = useState<UserProfileInterface | null>(null);

// 	useEffect(() => {
// 		getUserProfile(Number(userId.userId))
// 			.then(setProfile)
// 			.catch((err) => console.error("Failed to load profile", err));
// 	}, [userId]);

// 	return (
// 		<div className="flex flex-col items-center space-y-4">
// 			<Avatar className="h-16 w-16">
// 				<AvatarImage
// 					src={profile?.image || undefined}
// 					alt={profile?.name || "User"}
// 				/>
// 				<AvatarFallback>{profile?.name?.charAt(0) ?? "U"}</AvatarFallback>
// 			</Avatar>

// 			<div className="flex flex-col items-center gap-2 text-center">
// 				<p className="text-xl font-bold">{profile?.name}</p>
// 				<p>{profile?.bio}</p>
// 				<div className="flex items-center gap-1 text-sm text-muted-foreground">
// 					<CalendarDays />
// 					<span>
// 						Joined on{" "}
// 						{profile?.createdAt
// 							? format(profile?.createdAt, "MMMM do, yyyy")
// 							: null}
// 					</span>
// 				</div>
// 			</div>

// 			<div className="text-center">
// 				{profile?.pageContent && (
// 					<RichContentViewer content={profile.pageContent as JSONContent} />
// 				)}
// 			</div>
// 		</div>
// 	);
// }
