"use client";
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
const getLang = (lang: string) => {
	switch (lang.toLowerCase()) {
		case "javascript":
			return javascript();
		case "python":
			return python();
		case "markdown":
			return markdown();
		default:
			return javascript();
	}
};

export default function CodeViewer({
	code,
	language,
}: {
	code: string;
	language: string;
}) {
	const { theme } = useTheme();
	const editorTheme = theme === "dark" ? githubDark : githubLight;
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative rounded-md border bg-muted/30 overflow-hidden">
			<div className="flex items-center justify-between p-2 border-b text-xs bg-muted/30 text-muted-foreground font-mono">
				<span className="font-mono">{language.toUpperCase()}</span>
				<Button onClick={handleCopy} size="icon" variant="ghost">
					{copied ? (
						<Check className="h-4 w-4" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>
			</div>

			<CodeMirror
				value={code}
				readOnly
				theme={editorTheme}
				height="auto"
				basicSetup={{
					lineNumbers: true,
					highlightActiveLineGutter: true,
					foldGutter: true,
					highlightSpecialChars: true,
					drawSelection: true,
					indentOnInput: true,
				}}
				extensions={[getLang(language)]}
			/>
		</div>
	);
}
