"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { scriptPayloadSchemaType } from "@/lib/schemas/scriptSchema";

export default function SearchBar() {
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounce(query, 300);
	const [results, setResults] = useState<scriptPayloadSchemaType[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!debouncedQuery) return;

		setLoading(true);

		fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
			.then((res) => res.json())
			.then((data) => setResults(data))
			.catch((err) => console.error("Search error:", err))
			.finally(() => setLoading(false));
	}, [debouncedQuery]);

	return (
		<div className="space-y-4 max-w-2xl mx-auto">
			<input
				type="text"
				placeholder="Search scripts..."
				className="w-full border px-4 py-2 rounded-md"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>

			{loading && <p className="text-sm text-muted-foreground">Searching...</p>}

			{results.length > 0 && (
				<div className="grid gap-4">
					{results.map((script) => (
						<div key={script.id}>
							<p>{script.title}</p>
						</div>
					))}
				</div>
			)}

			{!loading && debouncedQuery && results.length === 0 && (
				<p className="text-sm text-muted-foreground">No results found.</p>
			)}
		</div>
	);
}
