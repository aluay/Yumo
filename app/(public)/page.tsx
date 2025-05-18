import PostsList from "@/components/shared/PostsList";
import PageLayout from "@/components/layouts/PageLayout";
import RecentActivity from "@/components/shared/RecentActivity";
import FeaturedPosts from "@/components/shared/FeaturedPosts";

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
					<FeaturedPosts />
				</>
			}>
			<PostsList />
		</PageLayout>
	);
}
