"use client";
import {
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorCommandList,
	EditorContent,
	type EditorInstance,
	EditorRoot,
	ImageResizer,
	type JSONContent,
	handleCommandNavigation,
	handleImageDrop,
	handleImagePaste,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "@/components/selectors/color-selector";
import { LinkSelector } from "@/components/selectors/link-selector";
import { MathSelector } from "@/components/selectors/math-selector";
import { NodeSelector } from "@/components/selectors/node-selector";
import { Separator } from "@/components/ui/separator";
import GenerativeMenuSwitch from "@/components/generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "@/components/selectors/text-buttons";
import { slashCommand, suggestionItems } from "@/components/editor/slash";
import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

interface NovelProps {
	value: JSONContent | null;
	onChange: (content: JSONContent) => void;
}

export function isEmptyEditorContent(
	content: JSONContent | null | undefined
): boolean {
	if (!content) return true;
	if (content.type !== "doc") return true;
	if (!Array.isArray(content.content)) return true;
	if (content.content.length === 0) return true;

	// Check if it's just an empty paragraph node
	if (
		content.content.length === 1 &&
		content.content[0].type === "paragraph" &&
		(!content.content[0].content || content.content[0].content.length === 0)
	) {
		return true;
	}

	return false;
}

const Novel = ({ value, onChange }: NovelProps) => {
	const [initialContent, setInitialContent] = useState<null | JSONContent>(
		null
	);
	const [saveStatus, setSaveStatus] = useState("Saved");
	const [charsCount, setCharsCount] = useState();

	const [openNode, setOpenNode] = useState(false);
	const [openColor, setOpenColor] = useState(false);
	const [openLink, setOpenLink] = useState(false);
	const [openAI, setOpenAI] = useState(false);

	// Apply Codeblock Highlighting on the HTML from editor.getHTML()
	const highlightCodeblocks = (content: string) => {
		const doc = new DOMParser().parseFromString(content, "text/html");
		doc.querySelectorAll("pre code").forEach((el) => {
			// @ts-expect-error type error
			// https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
			hljs.highlightElement(el);
		});
		return new XMLSerializer().serializeToString(doc);
	};

	const debouncedUpdates = useDebouncedCallback(
		async (editor: EditorInstance) => {
			const json = editor.getJSON();
			setCharsCount(editor.storage.characterCount.words());
			window.localStorage.setItem(
				"html-content",
				highlightCodeblocks(editor.getHTML())
			);
			window.localStorage.setItem("novel-content", JSON.stringify(json));
			window.localStorage.setItem(
				"markdown",
				editor.storage.markdown?.getMarkdown()
			);
			setSaveStatus("Saved");
		},
		500
	);

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
			<div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
				<div className="rounded-md bg-accent px-2 py-1 text-sm text-muted-foreground">
					{saveStatus}
				</div>
				<div
					className={
						charsCount
							? "rounded-md bg-accent px-2 py-1 text-sm text-muted-foreground"
							: "hidden"
					}>
					{charsCount} Words
				</div>
			</div>
			<EditorRoot>
				<EditorContent
					initialContent={initialContent}
					extensions={extensions}
					className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background border border-input rounded-md"
					editorProps={{
						handleDOMEvents: {
							keydown: (_view, event) => handleCommandNavigation(event),
						},
						handlePaste: (view, event) =>
							handleImagePaste(view, event, uploadFn),
						handleDrop: (view, event, _slice, moved) =>
							handleImageDrop(view, event, moved, uploadFn),
						attributes: {
							class:
								"prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
						},
					}}
					onUpdate={({ editor }) => {
						const json = editor.getJSON();
						onChange(json);
						debouncedUpdates(editor);
						setSaveStatus("Unsaved");
					}}
					slotAfter={<ImageResizer />}>
					<EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 border border-input transition-all">
						<EditorCommandEmpty className="px-2 text-muted-foreground">
							No results
						</EditorCommandEmpty>
						<EditorCommandList>
							{suggestionItems.map((item) => (
								<EditorCommandItem
									value={item.title}
									onCommand={(val) => item.command?.(val)}
									className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
									key={item.title}>
									<div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
										{item.icon}
									</div>
									<div>
										<p className="font-medium">{item.title}</p>
										<p className="text-xs text-muted-foreground">
											{item.description}
										</p>
									</div>
								</EditorCommandItem>
							))}
						</EditorCommandList>
					</EditorCommand>

					<GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
						<Separator orientation="vertical" />
						<NodeSelector open={openNode} onOpenChange={setOpenNode} />
						<Separator orientation="vertical" />
						<LinkSelector open={openLink} onOpenChange={setOpenLink} />
						<Separator orientation="vertical" />
						<MathSelector />
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

export default Novel;
