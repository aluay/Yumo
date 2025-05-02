import UserScripts from "@/components/shared/UserScripts";
import PageLayout from "@/components/layouts/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserBookmarks from "@/components/shared/UserBookmarks";
import UserRecentActivity from "@/components/shared/UserRecentActivity";
import { UserProfile } from "@/components/shared/UserProfile";

export default async function userPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const userId = decodeURIComponent(id);

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
						<UserScripts userId={Number(userId)} />
					</div>
				</TabsContent>
				<TabsContent value="profile">
					<div className="flex flex-col gap-4">
						<UserProfile userId={Number(userId)} />
					</div>
				</TabsContent>
				<TabsContent value="recent">
					<div className="flex flex-col gap-4">
						<UserRecentActivity userId={Number(userId)} />
					</div>
				</TabsContent>
				<TabsContent value="bookmarks">
					<div className="flex flex-col gap-4">
						<UserBookmarks userId={Number(userId)} />
					</div>
				</TabsContent>
			</Tabs>
		</PageLayout>
	);
}
