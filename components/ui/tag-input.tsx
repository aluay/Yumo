"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
}

export default function TagInput({
	value,
	onChange,
	placeholder = "Add a tag and press Enter...",
	disabled = false,
}: TagInputProps) {
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const addTag = (tag: string) => {
		const newTag = tag.trim();
		if (!newTag || value.includes(newTag)) return;
		onChange([...value, newTag]);
		setInputValue("");
	};

	const removeTag = (tag: string) => {
		onChange(value.filter((t) => t !== tag));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(inputValue);
		} else if (e.key === "Backspace" && !inputValue) {
			onChange(value.slice(0, -1));
		}
	};

	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[42px] bg-background",
				disabled && "bg-muted"
			)}>
			{value.map((tag) => (
				<Badge
					key={tag}
					variant="secondary"
					className="flex items-center gap-1">
					{tag}
					{!disabled && (
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="hover:text-destructive">
							<X className="w-3 h-3" />
						</button>
					)}
				</Badge>
			))}

			<input
				ref={inputRef}
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				className="flex-1 dark:bg-transparent outline-none text-sm min-w-[100px]"
				placeholder={placeholder}
				disabled={disabled}
			/>
		</div>
	);
}
