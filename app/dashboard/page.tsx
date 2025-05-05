import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import UserPosts from "@/components/shared/UserPosts";
import PageLayout from "@/components/layouts/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserBookmarks from "@/components/shared/UserBookmarks";
import UserRecentActivity from "@/components/shared/UserRecentActivity";
import { UserProfile } from "@/components/shared/UserProfile";

const Dashboard = async () => {
	const session = await auth();

	// if user is not signed in, redirect to homepage
	if (!session?.user) {
		redirect("/");
	}

	return (
		<PageLayout>
			<Tabs defaultValue="posts" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="posts">Posts</TabsTrigger>
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="recent">Recent</TabsTrigger>
					<TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
				</TabsList>
				<TabsContent value="posts">
					<div className="flex flex-col gap-4">
						<UserPosts userId={Number(session?.user.id)} />
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
