import PageLayout from "@/components/layouts/PageLayout";
import FollowTagButton from "@/components/shared/FollowTagButton";
import { getTopTags } from "@/lib/api/api";

export default async function TagsPage() {
	const session = { user: { id: 1 } };
	const tags = await getTopTags(20, session); // Fetch top 20 tags from the API
	console.log(tags);
	return (
		<PageLayout>
			<div className="container mx-auto py-8">
				<h1 className="text-2xl font-bold mb-4">Top Tags</h1>
				<ul className="space-y-4">
					{tags.map((tag) => (
						<li key={tag.name} className="flex items-center justify-between">
							<div>
								<span className="text-lg font-medium">{tag.name}</span>
								<span className="text-sm text-muted ml-2">
									{tag.postCount} posts
								</span>
							</div>
							<FollowTagButton
								tag={tag.name}
								initialIsFollowing={tag.isFollowing}
							/>
						</li>
					))}
				</ul>
			</div>
		</PageLayout>
	);
}
