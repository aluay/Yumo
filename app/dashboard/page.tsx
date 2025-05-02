import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import UserScripts from "@/components/shared/UserScripts";
import PageLayout from "@/components/layouts/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserBookmarks from "@/components/shared/UserBookmarks";
import UserRecentActivity from "@/components/shared/UserRecentActivity";
import { UserProfile } from "@/components/shared/UserProfile";

const Dashboard = async () => {
	const session = await auth();

	// if user is not signed in, redirect to homepage
	if (!session?.user) {
		console.log("User is not signed in");
		redirect("/");
	}

	return (
		<PageLayout>
			<Tabs defaultValue="scripts" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="scripts">Scripts</TabsTrigger>
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="recent">Recent</TabsTrigger>
					<TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
				</TabsList>
				<TabsContent value="scripts">
					<div className="flex flex-col gap-4">
						<UserScripts userId={Number(session?.user.id)} />
					</div>
				</TabsContent>
				<TabsContent value="profile">
					<div className="flex flex-col gap-4">
						<UserProfile userId={Number(session?.user.id)} />
					</div>
				</TabsContent>
				<TabsContent value="recent">
					<div className="flex flex-col gap-4">
						<UserRecentActivity userId={Number(session?.user.id)} />
					</div>
				</TabsContent>
				<TabsContent value="bookmarks">
					<div className="flex flex-col gap-4">
						<UserBookmarks userId={Number(session?.user.id)} />
					</div>
				</TabsContent>
			</Tabs>
		</PageLayout>
	);
};

export default Dashboard;
