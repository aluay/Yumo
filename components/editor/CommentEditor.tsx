"use client";

import {
	EditorContent,
	EditorRoot,
	type EditorInstance,
	type JSONContent,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { isEmptyEditorContent } from "@/components/editor/Novel";
import { ColorSelector } from "@/components/selectors/color-selector";
import { LinkSelector } from "@/components/selectors/link-selector";
import { NodeSelector } from "@/components/selectors/node-selector";
import { Separator } from "@/components/ui/separator";
import GenerativeMenuSwitch from "@/components/generative/generative-menu-switch";
import { TextButtons } from "@/components/selectors/text-buttons";
import Mention from "@tiptap/extension-mention";
import { searchUsersForMentions } from "@/lib/api/api";
import { starterKit, placeholder, taskList, taskItem } from "./extensions";
import tippy from "tippy.js";
import { Instance } from "tippy.js";
import { SuggestionProps } from "@tiptap/suggestion";
import {
	Color,
	TiptapUnderline,
	TiptapLink,
	HighlightExtension,
	TextStyle,
} from "novel";

export type MentionUser = {
	id: string;
	label: string;
};

export function renderItems(
	items: MentionUser[],
	command: (props: MentionUser) => void
) {
	const div = document.createElement("div");
	div.className = "flex flex-col rounded-md bg-background border shadow-sm";

	items.forEach((item) => {
		const button = document.createElement("button");
		button.className =
			"text-left px-4 py-2 hover:bg-muted focus:outline-none text-sm";
		button.innerText = item.label;
		button.addEventListener("click", () => {
			command(item);
		});

		div.appendChild(button);
	});

	return div;
}

export const customMention = Mention.extend({
	renderHTML({ node }) {
		return [
			"a",
			{
				href: `/users/${node.attrs.id}`,
				class: "mention",
				"data-id": node.attrs.id,
				"data-label": node.attrs.label,
			},
			`@${node.attrs.label}`,
		];
	},
}).configure({
	HTMLAttributes: {
		onClick: (event: MouseEvent) => {
			const id = (event.target as HTMLElement)?.dataset.id;
			if (id) {
				window.location.href = `/users/${id}`;
			}
		},
	},
	suggestion: {
		char: "@",
		items: async ({ query }) => {
			return await searchUsersForMentions(query);
		},

		render: () => {
			let popup: Instance | undefined;

			return {
				onStart: (props: SuggestionProps) => {
					const referenceClientRect = () => {
						const rect = props.clientRect?.();
						if (rect) return rect;
						return new DOMRect(0, 0, 0, 0);
					};

					popup = tippy(document.body, {
						getReferenceClientRect: referenceClientRect,
						appendTo: () => document.body,
						content: renderItems(props.items as MentionUser[], props.command),
						showOnCreate: true,
						interactive: true,
						trigger: "manual",
						placement: "bottom-start",
					});
				},
				onUpdate(props: SuggestionProps) {
					if (!popup) return;
					popup.setContent(
						renderItems(props.items as MentionUser[], props.command)
					);
				},
				onExit() {
					if (!popup) return;
					popup.destroy();
				},
			};
		},
	},
});

const extensions = [
	starterKit,
	Color,
	TiptapLink,
	taskList,
	taskItem,
	HighlightExtension,
	TextStyle,
	TiptapUnderline,
	customMention,
	placeholder.configure({
		placeholder: "Write a comment...",
	}),
];

interface CommentEditorProps {
	value: JSONContent | null;
	onChange: (content: JSONContent) => void;
}

const CommentEditor = ({ value, onChange }: CommentEditorProps) => {
	const [initialContent, setInitialContent] = useState<null | JSONContent>(
		null
	);

	const debouncedUpdates = useDebouncedCallback(
		async (editor: EditorInstance) => {
			const json = editor.getJSON();
			onChange(json);
		},
		300
	);
	const [openNode, setOpenNode] = useState(false);
	const [openColor, setOpenColor] = useState(false);
	const [openLink, setOpenLink] = useState(false);
	const [openAI, setOpenAI] = useState(false);

	useEffect(() => {
		const defaultEditorContent = {
			type: "doc",
			content: [{ type: "paragraph" }],
		};
		if (isEmptyEditorContent(value)) setInitialContent(defaultEditorContent);
		else setInitialContent(value);
	}, [value]);

	if (!initialContent) return null;

	return (
		<div className="relative w-full max-w-screen-lg rounded-md">
			<EditorRoot>
				<EditorContent
					initialContent={initialContent}
					extensions={extensions}
					className="relative w-full max-w-screen-lg border-muted bg-background border border-input rounded-md p-0"
					editorProps={{
						attributes: {
							class: "focus:outline-none font-default text-sm",
						},
					}}
					onUpdate={({ editor }) => {
						const json = editor.getJSON();
						onChange(json);
						debouncedUpdates(editor);
					}}>
					<GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
						<Separator orientation="vertical" />
						<NodeSelector open={openNode} onOpenChange={setOpenNode} />
						<Separator orientation="vertical" />
						<LinkSelector open={openLink} onOpenChange={setOpenLink} />
						<Separator orientation="vertical" />
						<TextButtons />
						<Separator orientation="vertical" />
						<ColorSelector open={openColor} onOpenChange={setOpenColor} />
					</GenerativeMenuSwitch>
				</EditorContent>
			</EditorRoot>
		</div>
	);
};

export default CommentEditor;
