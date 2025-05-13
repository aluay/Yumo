"use client";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { defaultExtensions } from "@/components/editor/extensions";
import { customMention } from "../editor/CommentEditor";
import type { JSONContent } from "@tiptap/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function RichContentViewer({
	content,
}: {
	content: JSONContent;
}) {
	const extensions = [...defaultExtensions, customMention];
	const editor = useEditor({
		extensions,
		content,
		editable: false,
		immediatelyRender: false,
	});
	const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

	if (!editor) return null;

	return (
		<>
			<div
				className="prose dark:prose-invert max-w-none [&_.ProseMirror]:p-0 rounded"
				onClick={(e) => {
					const target = e.target as HTMLElement;
					if (target.tagName === "IMG" && target instanceof HTMLImageElement) {
						setEnlargedImage(target.src);
					}
				}}>
				<EditorContent editor={editor} />
			</div>

			<Dialog
				open={!!enlargedImage}
				onOpenChange={(open) => !open && setEnlargedImage(null)}>
				<DialogTrigger asChild></DialogTrigger>
				{/* Gotta have DialogTitle or else it throws an error */}
				<DialogTitle></DialogTitle>
				<DialogContent className="max-w-4xl p-4 flex flex-col items-center">
					{enlargedImage && (
						<Image
							src={enlargedImage}
							width={800}
							height={800}
							alt="Enlarged"
							className="max-w-full max-h-[80vh] object-contain"
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
