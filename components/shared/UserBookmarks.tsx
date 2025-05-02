"use client";

import ScriptFeed from "./ScriptFeed";

interface UserBookmarksProps {
	userId: number;
}

const UserBookmarks = (userId: UserBookmarksProps) => {
	return (
		<>
			<ScriptFeed
				pageTitle="Your Bookmarks"
				endpoint={`/api/bookmark/user/${userId.userId}`}
				emptyTitle="No bookmarks"
				emptyMessage="Bookmarked scripts will show up here."
			/>
		</>
	);
};

export default UserBookmarks;
