"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { sql } from "@codemirror/lang-sql";
import { markdown } from "@codemirror/lang-markdown";
import { rust } from "@codemirror/lang-rust";
import { yaml } from "@codemirror/lang-yaml";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";
import { java } from "@codemirror/lang-java";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { vue } from "@codemirror/lang-vue";
import { php } from "@codemirror/lang-php";
import { less } from "@codemirror/lang-less";
import { angular } from "@codemirror/lang-angular";
import { sass } from "@codemirror/lang-sass";

import type { Extension } from "@codemirror/state";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { useTheme } from "next-themes";

interface CodeEditorProps {
	value: string;
	onChange: (val: string) => void;
	language?: string;
}

const getLanguageExtension = (lang: string): Extension => {
	switch (lang.toLowerCase()) {
		case "javascript":
		case "js":
		case "typescript":
		case "ts":
			return javascript();
		case "python":
			return python();
		case "html":
			return html();
		case "css":
			return css();
		case "sql":
			return sql();
		case "markdown":
			return markdown();
		case "rust":
			return rust();
		case "yaml":
			return yaml();
		case "cpp":
			return cpp();
		case "go":
			return go();
		case "java":
			return java();
		case "json":
			return json();
		case "xml":
			return xml();
		case "vue":
			return vue();
		case "php":
			return php();
		case "less":
			return less();
		case "angular":
			return angular();
		case "sass":
			return sass();
		default:
			return javascript();
	}
};

export default function CodeEditor({
	value,
	onChange,
	language = "javascript",
}: CodeEditorProps) {
	const { theme } = useTheme();
	const editorTheme = theme === "dark" ? githubDark : githubLight;

	return (
		<div className="border rounded-md overflow-hidden">
			<CodeMirror
				value={value}
				height="300px"
				theme={editorTheme}
				extensions={[getLanguageExtension(language)]}
				onChange={onChange}
			/>
		</div>
	);
}
