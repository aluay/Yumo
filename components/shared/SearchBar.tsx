import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { scriptPayloadSchemaType } from "@/lib/schemas/scriptSchema";

export default function SearchScripts() {
	const [query, setQuery] = useState("");
	const [debouncedQuery] = useDebounce(query, 300); // debounce by 300ms
	const [results, setResults] = useState<scriptPayloadSchemaType[]>([]);
	const inputRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!debouncedQuery.trim()) {
			setResults([]);
			return;
		}

		setLoading(true);

		const fetchResults = async () => {
			const res = await fetch(
				`/api/search?q=${encodeURIComponent(debouncedQuery)}`
			);
			const data = await res.json();
			setResults(data);
			setLoading(false);
		};

		fetchResults();
	}, [debouncedQuery]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={inputRef} className="relative w-full max-w-2xl mx-auto">
			{/* Input */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					className="pl-9"
					placeholder="Search..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
				/>
				{loading && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground">
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v8z"
							/>
						</svg>
					</div>
				)}
			</div>

			{/* Search Results */}
			{open && query && results.length > 0 && (
				<div className="absolute mt-2 w-full max-h-80 overflow-y-auto rounded-md border bg-background p-2 shadow-md overscroll-contain z-10">
					{results.map((script) => (
						<div key={script.id} className="p-2 hover:bg-muted rounded-sm">
							{script.title}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
