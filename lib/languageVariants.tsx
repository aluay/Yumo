// Custom Type for Language Variants for ShadCN badge component

export const languageVariants = [
	"python",
	"javascript",
	"typescript",
	"rust",
	"go",
	"sql",
	"bash",
] as const;

export type LanguageVariant = (typeof languageVariants)[number];

export function getSafeVariant(lang: string): LanguageVariant | "default" {
	return languageVariants.includes(lang as LanguageVariant)
		? (lang as LanguageVariant)
		: "default";
}
