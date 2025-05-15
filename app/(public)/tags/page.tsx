import PageLayout from "@/components/layouts/PageLayout";
import FollowTagButton from "@/components/shared/FollowTagButton";
import { getTopTags } from "@/lib/api/api";
import Link from "next/link";

export default async function TagsPage() {
	const session = { user: { id: 1 } };
	const tags = await getTopTags(20, session); // Fetch top 20 tags from the API
	return (
		<PageLayout>
			<div className="container mx-auto py-10 px-4">
				<h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center tracking-tight ">
					Tags
				</h1>
				<div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
					{tags.map((tag) => (
						<div key={tag.name}>
							<div className="flex flex-row items-center gap-4 w-full min-w-0 bg-accent/50 p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
								<div className="flex flex-col flex-1 min-w-0 gap-2">
									<Link
										href={`/tags/${encodeURIComponent(tag.name)}`}
										className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate w-fit">
										#{tag.name}
									</Link>
									<span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
										{tag.postCount} post{tag.postCount !== 1 ? "s" : ""}
									</span>
									<FollowTagButton
										tag={tag.name}
										initialIsFollowing={tag.isFollowing}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</PageLayout>
	);
}
