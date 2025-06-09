"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CommentEditor from "@/components/editor/CommentEditor";
import { commentInputSchema, CommentInput } from "@/lib/validation";
import {
	Form,
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@/components/ui/form";

interface CommentFormProps {
	postId: number;
	parentId?: number;
	onSuccess?: () => void;
}

export default function CommentForm({
	postId,
	parentId,
	onSuccess,
}: CommentFormProps) {
	const router = useRouter();
	const [editorKey, setEditorKey] = useState(0);
	const form = useForm<CommentInput>({
		resolver: zodResolver(commentInputSchema),
		defaultValues: {
			content: {
				type: "doc",
				content: [
					{
						type: "paragraph",
					},
				],
			},
			postId,
			parentId: parentId ?? undefined,
		},
	});

	const onSubmit = async (values: CommentInput) => {
		const json = values.content;

		const isEmpty =
			!json ||
			!json.content ||
			(json.content.length === 1 &&
				json.content[0].type === "paragraph" &&
				!json.content[0].content);

		if (isEmpty) {
			// console.warn("Cannot post an empty comment");
			return;
		}

		const payload = {
			...values,
			postId,
			parentId: parentId ?? undefined,
		};

		const res = await fetch(`/api/v1/posts/${postId}/comments`, {
			method: "POST",
			body: JSON.stringify(payload),
		});

		if (res.ok) {
			router.refresh();
			form.reset();
			setEditorKey((prev) => prev + 1);
			onSuccess?.();
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<CommentEditor
									key={editorKey}
									value={field.value}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Post Comment</Button>
			</form>
		</Form>
	);
}
