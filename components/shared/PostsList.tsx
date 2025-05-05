"use client";

import Feed from "./Feed";

const PostsList = () => {
	return (
		<>
			<Feed
				endpoint="/api/posts"
				pageTitle="Latest"
				emptyTitle="No posts found"
				emptyMessage="Try checking back later!"
			/>
		</>
	);
};

export default PostsList;
