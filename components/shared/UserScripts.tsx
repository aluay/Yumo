"use client";

import ScriptFeed from "./ScriptFeed";

interface UserScriptsProps {
	userId: number;
}

const UserScripts = (userId: UserScriptsProps) => {
	return (
		<>
			<ScriptFeed
				endpoint={`/api/scripts/user/${userId.userId}`}
				emptyTitle="No scripts yet"
				emptyMessage="Click 'New Script' to get started."
			/>
		</>
	);
};

export default UserScripts;
