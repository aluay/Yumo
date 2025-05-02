"use client";

import { useSession } from "next-auth/react";
import ScriptFeed from "./ScriptFeed";

const UserBookmarks = () => {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <p className="text-muted-foreground">Loading...</p>;
	}

	if (!session?.user?.id) {
		return <p className="text-destructive">Unable to load your scripts.</p>;
	}

	return (
		<>
			<ScriptFeed
				endpoint={`/api/bookmark/user/${session?.user.id}`}
				pageTitle="Your Bookmarks"
				emptyTitle="No bookmarks"
				emptyMessage="Bookmarked scripts will show up here."
			/>
		</>
	);
};

export default UserBookmarks;
