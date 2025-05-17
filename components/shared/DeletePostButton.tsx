"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useTransition, useState } from "react";

interface DeletePostButtonProps {
	postId: number;
	onDeleteSuccess?: () => void; // Make onDeleteSuccess optional
}

export default function DeletePostButton({
	postId,
	onDeleteSuccess,
}: DeletePostButtonProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState("");

	async function handleDelete() {
		const confirmed = window.confirm(
			"Are you sure you want to delete this post?"
		);
		if (!confirmed) return;

		try {
			const res = await fetch(`/api/v1/posts/${postId}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}

			// Call onDeleteSuccess if it was provided (though not used in current setup from post page)
			if (onDeleteSuccess) {
				onDeleteSuccess();
			}

			// Clear session storage for paginated posts directly
			if (typeof window !== "undefined") {
				sessionStorage.removeItem("paginatedPosts_posts");
				sessionStorage.removeItem("paginatedPosts_cursor");
			}

			startTransition(() => {
				// Navigate away since the post is deleted.
				// Homepage is a sensible default.
				router.push("/");
			});
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Failed to delete post");
			}
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<Button
				variant="destructive"
				size="icon"
				onClick={handleDelete}
				disabled={pending}>
				<Trash className="w-4 h-4" />
			</Button>

			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
