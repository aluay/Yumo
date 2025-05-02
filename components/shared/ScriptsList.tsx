"use client";

import ScriptFeed from "./ScriptFeed";

const ScriptsList = () => {
	return (
		<>
			<ScriptFeed
				endpoint="/api/scripts"
				pageTitle="All Scripts"
				emptyTitle="No scripts found"
				emptyMessage="Try checking back later!"
			/>
		</>
	);
};

export default ScriptsList;
