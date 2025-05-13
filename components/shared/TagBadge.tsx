"use client";

import { Badge } from "@/components/ui/badge";

interface TagBadgeProps {
	tag: string;
	className?: string;
}

export default function TagBadge({ tag, className }: TagBadgeProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		window.location.href = `/tags/${encodeURIComponent(tag)}`;
	};

	return (
		<Badge variant="outline" className={className} onClick={handleClick}>
			#{tag}
		</Badge>
	);
}
