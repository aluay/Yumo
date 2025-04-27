"use client";

import { Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface DeleteCommentButtonProps {
	commentId: number;
	authorId: number;
	onSuccess?: () => void;
}

export default function DeleteCommentButton({
	commentId,
	authorId,
	onSuccess,
}: DeleteCommentButtonProps) {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);

	const isOwner = Number(session?.user?.id) === authorId;
	if (!isOwner) return null;

	const deleteComment = async () => {
		if (!confirm("Are you sure you want to delete this comment?")) return;

		setLoading(true);

		const res = await fetch("/api/comment", {
			method: "DELETE",
			body: JSON.stringify({ commentId }),
		});

		if (res.ok) {
			onSuccess?.();
		}

		setLoading(false);
	};

	return (
		<Button
			size="icon"
			variant="ghost"
			disabled={loading}
			onClick={deleteComment}>
			<Trash className="w-4 h-4 text-red-500" />
		</Button>
	);
}
