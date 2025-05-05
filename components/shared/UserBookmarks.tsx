"use client";

import Feed from "./Feed";

interface UserBookmarksProps {
	userId: number;
}

const UserBookmarks = (userId: UserBookmarksProps) => {
	return (
		<>
			<Feed
				pageTitle="Bookmarks"
				endpoint={`/api/bookmark/user/${userId.userId}`}
				emptyTitle="No bookmarks"
				emptyMessage="Bookmarked posts will show up here."
			/>
		</>
	);
};

export default UserBookmarks;
