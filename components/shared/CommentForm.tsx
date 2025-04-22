"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

interface CommentFormProps {
	scriptId: number;
	parentId?: number;
	onSuccess?: () => void;
}

export default function CommentForm({
	scriptId,
	parentId,
	onSuccess,
}: CommentFormProps) {
	const { data: session } = useSession();
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		if (!content.trim()) return;

		setLoading(true);

		const res = await fetch("/api/comment", {
			method: "POST",
			body: JSON.stringify({ scriptId, parentId, content }),
		});

		if (res.ok) {
			setContent("");
			onSuccess?.();
		}

		setLoading(false);
	};

	if (!session?.user) return null;

	return (
		<div className="space-y-2">
			<Textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="Write a comment..."
			/>
			<Button onClick={submit} disabled={loading}>
				Post
			</Button>
		</div>
	);
}
