"use client";

import { Badge } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

// Helper to get a safe variant for Badge
function getTagVariant(tag: string): BadgeVariant {
	const allowedVariants: BadgeVariant[] = [
		"javascript",
		"typescript",
		"python",
		"ruby",
		"java",
		"go",
		"rust",
		"php",
		"csharp",
		"react",
		"vue",
		"angular",
		"svelte",
		"nextjs",
		"node",
		"tailwindcss",
		"css",
		"html",
		"graphql",
		"docker",
		"kubernetes",
		"git",
		"github",
		"vscode",
		"linux",
		"aws",
		"firebase",
		"mongodb",
		"sql",
		"webdev",
		"backend",
		"frontend",
		"opensource",
		"devops",
		"career",
		"learning",
		"productivity",
		"beginners",
		"testing",
		"design",
		"ux",
		"ai",
		"machinelearning",
		"datascience",
		"security",
		"encryption",
		"serverless",
		"cloud",
		"ci",
		"cd",
		"blockchain",
		"nft",
		"crypto",
		"webassembly",
		"pwa",
		"restapi",
		"microservices",
		"observability",
		"monitoring",
		"logging",
		"analytics",
		"bigdata",
		"elasticsearch",
		"redis",
		"postgres",
		"mysql",
		"sqlite",
		"artificialintelligence",
		"deeplearning",
		"reinforcementlearning",
		"devcommunity",
		"mentoring",
		"hackathon",
		"codingchallenge",
		"freelancing",
		"startup",
		"entrepreneurship",
		"leadership",
		"documentation",
		"api",
		"cli",
		"desktop",
		"mobile",
		"system",
		"web",
		"parse",
		"published",
		"draft",
	];
	const lower = tag.toLowerCase();
	return allowedVariants.includes(lower as BadgeVariant)
		? (lower as BadgeVariant)
		: "outline";
}

interface TagBadgeProps {
	tag: string;
	className?: string;
}

export default function TagBadge({ tag, className }: TagBadgeProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		window.location.href = `/tags/${encodeURIComponent(tag)}`;
	};

	const colorVariant = getTagVariant(tag);

	return (
		<Badge
			variant={colorVariant}
			className={
				"cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-150 text-xs py-0.5 px-1.5 " +
				(className || "")
			}
			onClick={handleClick}>
			#{tag}
		</Badge>
	);
}
