"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { defaultExtensions } from "@/components/editor/extensions";
import { slashCommand } from "@/components/editor/slash";
import type { JSONContent } from "@tiptap/react";

export default function RichContentViewer({
	content,
}: {
	content: JSONContent;
}) {
	const extensions = [...defaultExtensions, slashCommand];
	const editor = useEditor({
		extensions: extensions,
		content,
		editable: false,
		immediatelyRender: false,
	});

	if (!editor) return null;

	return (
		<div className="prose dark:prose-invert max-w-none [&_.ProseMirror]:p-0 rounded py-4">
			<EditorContent editor={editor} />
		</div>
	);
}
