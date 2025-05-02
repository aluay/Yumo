import PageLayout from "@/components/layouts/PageLayout";
import ScriptFeed from "@/components/shared/ScriptFeed";

export default async function TagsPage({
	params,
}: {
	params: Promise<{ tag: string }>;
}) {
	const { tag } = await params;
	const tagName = decodeURIComponent(tag);

	return (
		<PageLayout>
			<ScriptFeed
				endpoint={`${process.env.NEXT_PUBLIC_SITE_URL}/api/tags/${tagName}/scripts`}
				pageTitle={`Scripts tagged with [${tagName}]`}
				emptyTitle={`No scripts found for [${tagName}]`}
				emptyMessage="Try checking back later!"
			/>
		</PageLayout>
	);
}
