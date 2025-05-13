"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadProps {
	currentImage: string | null | undefined;
	onChange: (url: string) => void;
	name: string;
}

export function AvatarUpload({
	currentImage,
	onChange,
	name,
}: AvatarUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		currentImage || null
	);

	// For debugging
	console.log("AvatarUpload initialized with image:", currentImage);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.includes("image/")) {
			toast.error("Only images are allowed.");
			return;
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size must be less than 5MB.");
			return;
		}

		setIsUploading(true);

		try {
			// Create preview
			const localPreview = URL.createObjectURL(file);
			setPreviewUrl(localPreview);

			// Upload to server
			const response = await fetch("/api/v1/upload", {
				method: "POST",
				headers: {
					"content-type": file.type || "application/octet-stream",
				},
				body: file,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}
			const { url } = await response.json();

			// Ensure URL starts with / for relative paths
			const sanitizedUrl = url.startsWith("/") ? url : `/${url}`;

			onChange(sanitizedUrl);
			toast.success("Profile image uploaded successfully!");
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload image. Please try again.");
			// Revert to previous image if upload fails
			setPreviewUrl(currentImage || null);
		} finally {
			setIsUploading(false);
		}
	};
	const handleRemove = () => {
		setPreviewUrl(null);
		// Set to null instead of empty string to ensure it's properly handled in the database
		onChange("");
		toast.success("Profile image removed");
	};

	const firstLetter = name.charAt(0) || "U";
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="relative">
				<Avatar className="h-24 w-24">
					{previewUrl ? (
						<AvatarImage src={previewUrl} alt={name || "User"} />
					) : (
						<AvatarFallback className="text-xl">{firstLetter}</AvatarFallback>
					)}
				</Avatar>

				{previewUrl && (
					<button
						type="button"
						onClick={handleRemove}
						className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
						aria-label="Remove image">
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="relative"
					disabled={isUploading}>
					<input
						type="file"
						className="absolute inset-0 cursor-pointer opacity-0"
						onChange={handleFileChange}
						accept="image/*"
						disabled={isUploading}
					/>
					<UploadCloud className="mr-2 h-4 w-4" />
					{isUploading ? "Uploading..." : "Upload Image"}
				</Button>
			</div>
		</div>
	);
}
