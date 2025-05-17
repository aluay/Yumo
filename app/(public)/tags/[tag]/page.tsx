import { getTagPosts } from "@/lib/api/api";
import PostCard from "@/components/shared/PostCard";
import PageLayout from "@/components/layouts/PageLayout";
import FollowTagButton from "@/components/shared/FollowTagButton";
import { auth } from "@/lib/auth";
import { isUserFollowingTag } from "@/lib/api/api";

export default async function TagsPage({
	params,
}: {
	params: Promise<{ tag: string }>;
}) {
	const { tag } = await params;
	const tagName = decodeURIComponent(tag);
	const posts = await getTagPosts(tagName);
	const session = await auth();

	// Check if user is following this tag
	const isFollowing = session?.user?.id
		? await isUserFollowingTag(Number(session.user.id), tagName)
		: false;

	if (!posts.length) {
		return (
			<PageLayout>
				<div className="space-y-6 max-w-7xl mx-auto mb-6">
					<h1 className="text-2xl font-bold">#{tagName}</h1>
					{session?.user && (
						<FollowTagButton tag={tagName} initialIsFollowing={isFollowing} />
					)}
				</div>
				<div className="text-center py-20">
					<h2 className="text-lg font-semibold">No results found</h2>
					<p className="text-sm text-muted-foreground mt-2">
						No posts to show here.
					</p>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<div className="space-y-6 max-w-7xl mx-auto mb-6">
				<h1 className="text-2xl font-bold">#{tagName}</h1>
				{session?.user && (
					<FollowTagButton tag={tagName} initialIsFollowing={isFollowing} />
				)}{" "}
			</div>
			<div className="space-y-6 max-w-7xl mx-auto">
				{posts.map((post) => (
					<div key={post.id}>
						<PostCard post={post} />
					</div>
				))}
			</div>
		</PageLayout>
	);
}
