import PostsList from "@/components/shared/PostsList";
import PageLayout from "@/components/layouts/PageLayout";
import RecentActivity from "@/components/shared/RecentActivity";

export default function Home() {
	return (
		<PageLayout
			sidebarRight={
				<>
					<RecentActivity />
				</>
			}
			sidebarLeft={
				<>
					<div className="bg-accent h-full">Left Side</div>
				</>
			}>
			<PostsList />
		</PageLayout>
	);
}
