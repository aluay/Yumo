"use client";

import ScriptFeed from "./ScriptFeed";

const ScriptsList = () => {
	return (
		<>
			<ScriptFeed
				endpoint="/api/scripts"
				emptyTitle="No scripts found"
				emptyMessage="Try checking back later!"
			/>
		</>
	);
};

export default ScriptsList;
