"use client";

import Feed from "./Feed";

const PostsList = () => {
	return (
		<>
			<Feed
				endpoint="/api/posts"
				pageTitle="All Posts"
				emptyTitle="No posts found"
				emptyMessage="Try checking back later!"
			/>
		</>
	);
};

export default PostsList;
