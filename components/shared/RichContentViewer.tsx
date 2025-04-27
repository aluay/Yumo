"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { defaultExtensions } from "@/components/editor/extensions";
import Mention from "@tiptap/extension-mention";
import type { JSONContent } from "@tiptap/react";

export default function RichContentViewer({
	content,
}: {
	content: JSONContent;
}) {
	const extensions = [...defaultExtensions, Mention];
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
