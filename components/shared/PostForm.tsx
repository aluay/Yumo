"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Novel from "@/components/editor/Novel";
import TagInput from "@/components/ui/tag-input";
import { postInputSchema, PostInput, PostPayload } from "@/lib/validation/post";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertCircle,
	FileText,
	Pencil,
	Save,
	SendIcon,
	Tag,
} from "lucide-react";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
		<Card className="max-w-5xl w-full mx-auto shadow-lg border-t-4 border-t-primary animate-in fade-in duration-500">
			<CardHeader className="pb-4 bg-muted/30 rounded-t-lg">
				<div className="flex items-center gap-2.5">
					{isEditing ? (
						<Pencil className="h-5 w-5 text-primary" />
					) : (
						<FileText className="h-5 w-5 text-primary" />
					)}
					<CardTitle className="text-2xl gradient-text">
						{isEditing ? "Edit Post" : "Create New Post"}
					</CardTitle>
				</div>
				<CardDescription className="text-sm mt-1.5 italic">
					Share your thoughts, ideas, and expertise with the community
				</CardDescription>
			</CardHeader>
			<Form {...form}>
				<CardContent className="space-y-7 pt-6">
					{error && (
						<Alert
							variant="destructive"
							className="animate-in slide-in-from-top duration-300">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<form
						id="post-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="transition-all duration-200 hover:shadow-sm rounded-lg p-1">
									<FormLabel className="text-base font-semibold flex items-center gap-2">
										<span className="text-primary">Title</span>
										<Separator className="flex-1 h-px" />
									</FormLabel>
									<FormControl>
										<Input
											className="focus-visible:ring-primary/20 focus-visible:ring-offset-0 text-lg font-medium pl-3 transition-all py-6"
											{...field}
											placeholder="Give your post a compelling title"
										/>
									</FormControl>
									<FormDescription className="text-xs text-muted-foreground ml-1 mt-1.5">
										Summarize your post in one sentence. Good titles attract
										more readers.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="transition-all duration-200 hover:shadow-sm rounded-lg p-1">
									<FormLabel className="text-base font-semibold flex items-center gap-2">
										<span className="text-primary">Description</span>
										<Separator className="flex-1 h-px" />
									</FormLabel>
									<FormControl>
										<Textarea
											className="resize-none focus-visible:ring-primary/20 focus-visible:ring-offset-0 min-h-28 pl-3 transition-all"
											{...field}
											placeholder="Write a brief summary of your post"
										/>
									</FormControl>
									<FormDescription className="text-xs text-muted-foreground ml-1 mt-1.5">
										A concise preview to catch readers&apos; attention. This
										will appear in post listings.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="tags"
							render={({ field }) => (
								<FormItem className="transition-all duration-200 hover:shadow-sm rounded-lg p-1">
									<FormLabel className="text-base font-semibold flex items-center gap-2">
										<span className="text-primary flex items-center">
											<Tag className="w-4 h-4 mr-1.5" />
											Tags
										</span>
										<Separator className="flex-1 h-px" />
									</FormLabel>
									<FormControl>
										<TagInput
											value={field.value || []}
											onChange={field.onChange}
											placeholder="Add tags and press Enter..."
										/>
									</FormControl>
									<FormDescription className="text-xs text-muted-foreground ml-1 mt-1.5">
										Add relevant tags to help readers discover your post. Use
										the Enter key to add each tag.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="relative py-3">
							<Separator className="absolute left-0 right-0" />
							<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
								Content Editor
							</div>
						</div>

						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem className="transition-all duration-200 hover:shadow-sm rounded-lg p-1">
									<FormLabel className="text-base font-semibold flex items-center gap-2">
										<span className="text-primary">Content</span>
										<Separator className="flex-1 h-px" />
									</FormLabel>
									<div className="border rounded-md overflow-hidden shadow-sm">
										<Novel value={field.value} onChange={field.onChange} />
									</div>
									<FormDescription className="text-xs text-muted-foreground ml-1 mt-1.5 pt-2">
										Express your ideas with rich formatting options. Add links,
										images, and more to enhance your post.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t bg-muted/20 px-6 py-5">
					<div className="text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left w-full sm:w-auto">
						{isEditing
							? "Update your post when ready"
							: "Publish when you're ready to share"}
					</div>
					<div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
						<Button
							form="post-form"
							disabled={submitting}
							type="submit"
							onClick={() => form.setValue("status", "DRAFT")}
							variant="outline"
							className="flex-1 sm:flex-auto gap-2 border-primary/30 hover:bg-primary/5 transition-all">
							<Save className="h-4 w-4" />
							{submitting ? "Saving..." : "Save as Draft"}
						</Button>

						<Button
							form="post-form"
							disabled={submitting}
							type="submit"
							onClick={() => form.setValue("status", "PUBLISHED")}
							className="flex-1 sm:flex-auto gap-2 bg-primary hover:bg-primary/90 transition-all">
							<SendIcon className="h-4 w-4" />
							{submitting ? "Publishing..." : "Publish"}
						</Button>
					</div>
				</CardFooter>
			</Form>
		</Card>
	);
}
