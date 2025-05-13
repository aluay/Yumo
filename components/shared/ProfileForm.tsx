"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileInputSchema } from "@/lib/validation/post";
import { JSONContent } from "@tiptap/react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Novel from "@/components/editor/Novel";
import { useRouter } from "next/navigation";

type ProfileInput = z.infer<typeof profileInputSchema>;

interface ProfileFormProps {
	userId: number;
	defaultValues: ProfileInput;
}

export default function ProfileForm({
	userId,
	defaultValues,
}: ProfileFormProps) {
	const [submitting, setSubmitting] = useState(false);
	const router = useRouter();
	const form = useForm<ProfileInput>({
		resolver: zodResolver(profileInputSchema),
		defaultValues,
	});

	const onSubmit = async (values: ProfileInput) => {
		setSubmitting(true);
		try {
			const res = await fetch(`/api/v1/users/${userId}/profile`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});

			if (res.ok) router.push(`/users/${userId}`);
		} catch (err) {
			console.error("Update failed", err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="image"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Profile Image URL</FormLabel>
							<FormControl>
								<Input {...field} value={field.value ?? ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="website"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Website</FormLabel>
							<FormControl>
								<Input {...field} value={field.value ?? ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bio</FormLabel>
							<FormControl>
								<Textarea {...field} value={field.value ?? ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="pageContent"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Custom Page Content</FormLabel>
							<FormControl>
								<Novel
									value={field.value as JSONContent}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={submitting}>
					{submitting ? "Saving..." : "Update Profile"}
				</Button>
			</form>
		</Form>
	);
}
