import PostsList from "@/components/shared/PostsList";
import PageLayout from "@/components/layouts/PageLayout";

export default function Home() {
	return (
		<PageLayout
			sidebarRight={
				<>
					<div className="bg-accent h-full">Right Side</div>
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
