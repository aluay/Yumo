"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Novel from "@/components/editor/Novel";
import TagInput from "@/components/ui/tag-input";
import CodeEditor from "@/components/shared/CodeMirror";
import {
	postSchema,
	postSchemaType,
	postSchemaWithIdType,
} from "@/lib/schemas/postSchema";

import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";

interface PostFormProps {
	defaultValues?: Partial<postSchemaWithIdType>;
}

export default function PostForm({ defaultValues }: PostFormProps) {
	const router = useRouter();
	const isEditing = !!defaultValues?.id;

	const form = useForm<postSchemaType>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: "",
			description: "",
			language: "",
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

	const onSubmit = async (values: postSchemaType) => {
		const payload = {
			...values,
		};
		const endpoint = isEditing
			? `/api/posts/${defaultValues.id}`
			: "/api/posts";
		const method = isEditing ? "PATCH" : "POST";

		const res = await fetch(endpoint, {
			method,
			body: JSON.stringify(payload),
		});

		if (res.ok) router.push("/dashboard");
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">Title</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Post title goes here..." />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="language"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">Language</FormLabel>
							<FormControl>
								<Input {...field} placeholder="e.g.TypeScript" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Code</FormLabel>
							<CodeEditor
								value={field.value}
								onChange={field.onChange}
								language={form.watch("language")}
							/>
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
									{...field}
									placeholder="Add description that others will see at a glance"
								/>
							</FormControl>
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
						type="submit"
						onClick={() => form.setValue("status", "DRAFT")}
						variant="secondary">
						Save as Draft
					</Button>

					<Button
						type="submit"
						onClick={() => form.setValue("status", "PUBLISHED")}>
						Save & Publish
					</Button>
				</div>
			</form>
		</Form>
	);
}
