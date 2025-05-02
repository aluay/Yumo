"use client";

import { useSession } from "next-auth/react";
import ScriptFeed from "./ScriptFeed";

const UserScripts = () => {
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
				endpoint={`/api/scripts/user/${session?.user.id}`}
				pageTitle="Your Scripts"
				emptyTitle="No scripts yet"
				emptyMessage="Click 'New Script' under your profile image to get started."
			/>
		</>
	);
};

export default UserScripts;
