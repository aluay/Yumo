"use client";
import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Copy, Check, Maximize2, Minimize2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getLanguageExtension } from "./CodeMirror";

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
	const [expanded, setExpanded] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	useEffect(() => {
		const timeout = setTimeout(() => setExpanded(true), 50);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<div className="relative rounded-md border overflow-hidden">
			<div className="flex items-center justify-between px-2 py-1 border-b text-xs text-muted-foreground font-mono">
				<Badge className="rounded-none border-none" variant="outline">
					{language.toUpperCase()}
				</Badge>
				<div className="flex">
					<Button onClick={handleCopy} size="icon" variant="ghost">
						{copied ? (
							<Check className="h-4 w-4" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
					<Separator orientation="vertical" className="h-10 mx-1" />
					<Button
						onClick={() => setExpanded((prev) => !prev)}
						size="icon"
						variant="ghost">
						{expanded ? <Minimize2 /> : <Maximize2 />}
					</Button>
				</div>
			</div>
			<div
				className={`transition-all duration-500 overflow-hidden ${
					expanded ? "max-h-[600px] opacity-100" : "max-h-[0px] opacity-0"
				}`}>
				<CodeMirror
					value={code}
					readOnly
					theme={editorTheme}
					height="auto"
					className="min-h-[300px] bg-muted/30"
					basicSetup={{
						lineNumbers: true,
						highlightActiveLineGutter: false,
						foldGutter: false,
						highlightSpecialChars: false,
						drawSelection: false,
						indentOnInput: false,
						bracketMatching: true,
					}}
					extensions={[getLanguageExtension(language)]}
				/>
			</div>
		</div>
	);
}
