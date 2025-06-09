"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileInputSchema } from "@/lib/validation";
import { JSONContent } from "@tiptap/react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Novel from "@/components/editor/Novel";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { AvatarUpload } from "./AvatarUpload";

type ProfileFormValues = z.infer<typeof profileInputSchema>;

interface ProfileFormProps {
	userId: number;
	defaultValues: Partial<ProfileFormValues>;
}

export default function ProfileForm({
	userId,
	defaultValues,
}: ProfileFormProps) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	// Set defaults for required fields
	const formValues = {
		...defaultValues,
		name: defaultValues.name || "",
		showEmail:
			defaultValues.showEmail === undefined ? true : defaultValues.showEmail,
	};

	// Use any to bypass TypeScript errors
	const form = useForm({
		resolver: zodResolver(profileInputSchema),
		defaultValues: formValues,
	});

	const onSubmit = async (values: ProfileFormValues) => {
		setSubmitting(true);
		setError(null);

		try {
			// Ensure image value is valid (empty string, null, undefined, or starts with /)
			let imageValue = values.image;
			if (
				imageValue &&
				!imageValue.startsWith("/") &&
				!imageValue.startsWith("http")
			) {
				console.warn("Invalid image URL format - sanitizing:", imageValue);
				// If it doesn't start with / or http, assume it's relative and add /
				imageValue = `/${imageValue}`;
			}

			// Ensure showEmail is a boolean
			const submitData = {
				...values,
				image: imageValue,
				showEmail: values.showEmail === undefined ? true : !!values.showEmail,
			};

			const res = await fetch(`/api/v1/users/${userId}/profile`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(submitData),
			});

			if (res.ok) {
				router.push(`/users/${userId}`);
			} else {
				const errorData = await res.json().catch(() => null);
				console.error("Profile update failed:", res.status, errorData);

				// Show more specific error message if available
				if (errorData?.error?.image?._errors) {
					const imageErrors = errorData.error.image._errors.join(", ");
					setError(`Profile image error: ${imageErrors}`);
				} else {
					setError("Failed to update profile. Please try again.");
				}
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

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="image"
					render={({ field }) => (
						<FormItem className="flex flex-col items-center">
							<FormLabel className="mb-2">Profile Picture</FormLabel>
							<FormControl>
								<AvatarUpload
									currentImage={field.value}
									onChange={field.onChange}
									name={form.getValues().name || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

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
					name="showEmail"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">Email Visibility</FormLabel>
								<FormDescription>
									Allow other users to see your email address on your profile
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
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
