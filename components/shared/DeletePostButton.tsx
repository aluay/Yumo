"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useTransition, useState } from "react";

export default function DeletePostButton({ postId }: { postId: number }) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState("");

	async function handleDelete() {
		const confirmed = window.confirm(
			"Are you sure you want to delete this post?"
		);
		if (!confirmed) return;

		try {
			const res = await fetch(`/api/posts/${postId}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}

			startTransition(() => {
				router.back();
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
