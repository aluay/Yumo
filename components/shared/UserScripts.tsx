"use client";

import ScriptFeed from "./ScriptFeed";

interface UserScriptsProps {
	userId: number;
}

const UserScripts = (userId: UserScriptsProps) => {
	return (
		<>
			<ScriptFeed
				pageTitle="Scripts"
				endpoint={`/api/scripts/user/${userId.userId}`}
				emptyTitle="No scripts yet"
				emptyMessage="Click 'New Script' under your profile image to get started."
			/>
		</>
	);
};

export default UserScripts;
