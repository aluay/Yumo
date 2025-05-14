"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Novel from "@/components/editor/Novel";
import TagInput from "@/components/ui/tag-input";
// import CodeEditor from "@/components/shared/CodeMirror";
import { postInputSchema, PostInput, PostPayload } from "@/lib/validation/post";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";

interface PostFormProps {
	defaultValues?: Partial<PostPayload>;
}

export default function PostForm({ defaultValues }: PostFormProps) {
	const router = useRouter();
	const isEditing = !!defaultValues?.id;
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<PostInput>({
		resolver: zodResolver(postInputSchema),
		defaultValues: {
			title: "",
			description: "",
			tags: [],
			content: {
				type: "doc",
				content: [
					{
						type: "paragraph",
					},
				],
			},
			...defaultValues,
		},
	});

	const onSubmit = async (values: PostInput) => {
		setSubmitting(true);
		setError(null);
		try {
			const endpoint = isEditing
				? `/api/v1/posts/${defaultValues.id}`
				: "/api/v1//posts";
			const method = isEditing ? "PATCH" : "POST";

			const res = await fetch(endpoint, {
				method,
				body: JSON.stringify(values),
			});

			if (method === "PATCH") {
				if (res.ok) router.push(`/posts/${defaultValues?.id}`);
			} else {
				const data = await res.json();
				router.push(`/posts/${data.id}`);
			}
		} catch (err) {
			console.error("Update failed", err);
			setError("An error occurred while updating your profile.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			{error && (
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">Title</FormLabel>
							<FormControl>
								<Input
									className="focus-visible:ring-transparent"
									{...field}
									placeholder="Post title"
								/>
							</FormControl>
							<FormDescription>
								Summarize your post in one sentence.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">Description</FormLabel>
							<FormControl>
								<Textarea
									className="resize-none focus-visible:ring-transparent"
									{...field}
									placeholder="Post description"
								/>
							</FormControl>
							<FormDescription>
								A quick summary to catch readers attention.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="tags"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tags</FormLabel>
							<FormControl>
								<TagInput value={field.value || []} onChange={field.onChange} />
							</FormControl>
							<FormDescription>
								Add tags to highlight the topics in your post.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Content</FormLabel>
							<Novel value={field.value} onChange={field.onChange} />
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="w-full flex justify-between">
					<Button
						disabled={submitting}
						type="submit"
						onClick={() => form.setValue("status", "DRAFT")}
						variant="secondary">
						{submitting ? "Saving..." : "Save as Draft"}
					</Button>

					<Button
						disabled={submitting}
						type="submit"
						onClick={() => form.setValue("status", "PUBLISHED")}>
						{submitting ? "Publishing..." : "Publish"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
