import PageLayout from "@/components/layouts/PageLayout";
import Feed from "@/components/shared/Feed";

export default async function TagsPage({
	params,
}: {
	params: Promise<{ tag: string }>;
}) {
	const { tag } = await params;
	const tagName = decodeURIComponent(tag);

	return (
		<PageLayout>
			<Feed
				endpoint={`${process.env.NEXT_PUBLIC_SITE_URL}/api/tags/${tagName}/posts`}
				pageTitle={`Posts tagged with [${tagName}]`}
				emptyTitle={`No posts found for [${tagName}]`}
				emptyMessage="Try checking back later!"
			/>
		</PageLayout>
	);
}
