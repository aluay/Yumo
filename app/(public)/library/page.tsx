import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LibraryPostsList from "@/components/shared/LibraryPostsList";
import PageLayout from "@/components/layouts/PageLayout";
import { getUserBookmarkedPosts } from "@/lib/api/api";

async function getBookmarkedPosts({
	sort = "recent" as const,
	limit = 10,
} = {}) {
	// Get the session directly
	const session = await auth();
	if (!session?.user) {
		// Return empty results if not authenticated
		return { data: [], nextCursor: null, totalCount: 0 };
	}

	// Get the user ID from the session
	// Note: session.user.id is a string, so we need to convert it to a number
	const userId = Number(session.user.id);

	// Get user's bookmarked posts from the API and handle pagination
	// Include the total count of bookmarks
	return getUserBookmarkedPosts({ userId, sort, limit, includeCount: true });
}

export default async function LibraryPage() {
	const session = await auth();

	// Redirect to login if not authenticated
	if (!session?.user) {
		redirect("/");
	}
	// Fetch bookmarked posts
	const { data: posts, nextCursor } = await getBookmarkedPosts();

	return (
		<PageLayout>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
				{" "}
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
						<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
							Your Library
						</h1>
					</div>
					<p className="text-muted-foreground text-lg">
						{"A collection of posts you've bookmarked for later."}
					</p>
				</div>
				<LibraryPostsList
					initialPosts={posts}
					initialCursor={nextCursor}
					initialSort="recent"
				/>
			</div>
		</PageLayout>
	);
}
