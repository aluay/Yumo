"use client";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import RichContentViewer from "@/components/shared/RichContentViewer";
import type { JSONContent } from "@tiptap/react";
import Link from "next/link";

interface PostPreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	tags: string[];
	content: JSONContent;
}

export default function PostPreviewDialog({
	open,
	onOpenChange,
	title,
	description,
	tags,
	content,
}: PostPreviewDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<DialogTitle>Post Preview</DialogTitle>
				<DialogDescription className="mb-4 border-b pb-2">
					This is how your post will look when published.
				</DialogDescription>
				<div className="flex flex-col gap-4">
					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-snug sm:leading-tight">
						{title}
					</h1>
					<div className="mt-2 sm:mt-3">
						{description && (
							<p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
								{description}
							</p>
						)}
					</div>

					<div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
						{tags.map((tag, index) => (
							<Link
								href={`/tags/${encodeURIComponent(tag)}`}
								key={index}
								className="hover:text-foreground transition-colors">
								<span className="font-medium">#{tag}</span>
							</Link>
						))}
					</div>
				</div>

				{content && (
					<div>
						<RichContentViewer content={content as JSONContent} />
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
