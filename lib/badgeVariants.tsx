// Custom Type for badge variants for ShadCN badge component

export const BadgeVariants = [
	"python",
	"javascript",
	"typescript",
	"rust",
	"go",
	"sql",
	"bash",
	"published",
	"draft",
] as const;

export type BadgeVariant = (typeof BadgeVariants)[number];

export function getSafeVariant(lang: string): BadgeVariant | "default" {
	return BadgeVariants.includes(lang as BadgeVariant)
		? (lang as BadgeVariant)
		: "default";
}
