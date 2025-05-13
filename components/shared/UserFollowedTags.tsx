"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FollowedTag {
	tag: string;
	createdAt: string;
}

interface UserFollowedTagsProps {
	userId: number;
}

export default function UserFollowedTags({ userId }: UserFollowedTagsProps) {
	const [followedTags, setFollowedTags] = useState<FollowedTag[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchFollowedTags = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/v1/users/${userId}/tags`);

				if (!response.ok) {
					throw new Error("Failed to fetch followed tags");
				}

				const data = await response.json();
				setFollowedTags(data.data || []);
			} catch (err) {
				console.error("Error fetching followed tags:", err);
				setError("Failed to load followed tags");
			} finally {
				setIsLoading(false);
			}
		};

		fetchFollowedTags();
	}, [userId]);

	if (isLoading) {
		return (
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Followed Tags</h3>
				<div className="flex flex-wrap gap-2">
					{Array.from({ length: 5 }).map((_, index) => (
						<Skeleton key={index} className="h-6 w-16 rounded-full" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return <p className="text-sm text-muted-foreground">{error}</p>;
	}

	if (followedTags.length === 0) {
		return (
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Followed Tags</h3>
				<p className="text-sm text-muted-foreground">No tags followed yet</p>
			</div>
		);
	}
	return (
		<div className="space-y-2">
			<h3 className="text-lg font-medium">Followed Tags</h3>
			<div className="flex flex-wrap gap-2 min-h-[50px] max-h-[150px] overflow-y-auto">
				{followedTags.map((tagData) => (
					<Link
						key={tagData.tag}
						href={`/tags/${encodeURIComponent(tagData.tag)}`}>
						<Badge
							variant="secondary"
							className="hover:bg-secondary transition-colors">
							#{tagData.tag}
						</Badge>
					</Link>
				))}
			</div>
		</div>
	);
}
