"use client";

import { useEffect, useState } from "react";
import { scriptPayloadSchemaType } from "@/lib/schemas/scriptSchema";
import { ScriptCard } from "@/components/shared/ScriptCard";
import { fetchScripts } from "@/lib/api/api";

interface ScriptFeedProps {
	endpoint: string;
	emptyTitle?: string;
	emptyMessage?: string;
}

export default function ScriptFeed({
	endpoint,
	emptyTitle = "No results found",
	emptyMessage = "We couldn't find any scripts to show here.",
}: ScriptFeedProps) {
	const [scripts, setScripts] = useState<scriptPayloadSchemaType[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const data = await fetchScripts(endpoint);
				setScripts(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [endpoint]);

	if (loading) {
		return <p className="text-muted-foreground">Loading...</p>;
	}

	if (scripts.length === 0) {
		return (
			<div className="text-center py-20">
				<h2 className="text-lg font-semibold">{emptyTitle}</h2>
				<p className="text-sm text-muted-foreground mt-2">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full mx-auto mb-4">
			{scripts.map((script) => (
				<ScriptCard key={script.id} script={script} />
			))}
		</div>
	);
}
