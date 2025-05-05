"use client";

import Feed from "./Feed";

interface UserPostsProps {
	userId: number;
}

const UserPosts = (userId: UserPostsProps) => {
	return (
		<>
			<Feed
				pageTitle="Posts"
				endpoint={`/api/posts/user/${userId.userId}`}
				emptyTitle="No posts yet"
				emptyMessage="Click 'New Post' under your profile image to get started."
			/>
		</>
	);
};

export default UserPosts;
