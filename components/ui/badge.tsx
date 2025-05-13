import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "border-transparent text-foreground",

				// Tag colors
				javascript:
					"border-transparent text-yellow-500 hover:bg-yellow-500 hover:text-white",
				typescript:
					"border-transparent text-blue-500 hover:bg-blue-500 hover:text-white",
				python:
					"border-transparent text-green-500 hover:bg-green-500 hover:text-white",
				ruby: "border-transparent text-red-500 hover:bg-red-500 hover:text-white",
				java: "border-transparent text-orange-500 hover:bg-orange-500 hover:text-white",
				go: "border-transparent text-cyan-500 hover:bg-cyan-500 hover:text-white",
				rust: "border-transparent text-orange-600 hover:bg-orange-600 hover:text-white",
				php: "border-transparent text-indigo-500 hover:bg-indigo-500 hover:text-white",
				csharp:
					"border-transparent text-purple-500 hover:bg-purple-500 hover:text-white",
				react:
					"border-transparent text-sky-500 hover:bg-sky-500 hover:text-white",
				vue: "border-transparent text-emerald-500 hover:bg-emerald-500 hover:text-white",
				angular:
					"border-transparent text-red-600 hover:bg-red-600 hover:text-white",
				svelte:
					"border-transparent text-pink-500 hover:bg-pink-500 hover:text-white",
				nextjs:
					"border-transparent text-gray-800 hover:bg-gray-800 hover:text-white",
				node: "border-transparent text-green-600 hover:bg-green-600 hover:text-white",
				tailwindcss:
					"border-transparent text-teal-500 hover:bg-teal-500 hover:text-white",
				css: "border-transparent text-blue-400 hover:bg-blue-400 hover:text-white",
				html: "border-transparent text-orange-400 hover:bg-orange-400 hover:text-white",
				graphql:
					"border-transparent text-pink-600 hover:bg-pink-600 hover:text-white",
				docker:
					"border-transparent text-blue-600 hover:bg-blue-600 hover:text-white",
				kubernetes:
					"border-transparent text-blue-700 hover:bg-blue-700 hover:text-white",
				git: "border-transparent text-red-600 hover:bg-red-600 hover:text-white",
				github:
					"border-transparent text-gray-700 hover:bg-gray-700 hover:text-white",
				vscode:
					"border-transparent text-indigo-600 hover:bg-indigo-600 hover:text-white",
				linux:
					"border-transparent text-yellow-600 hover:bg-yellow-600 hover:text-white",
				aws: "border-transparent text-orange-500 hover:bg-orange-500 hover:text-white",
				firebase:
					"border-transparent text-amber-500 hover:bg-amber-500 hover:text-white",
				mongodb:
					"border-transparent text-green-700 hover:bg-green-700 hover:text-white",
				sql: "border-transparent text-indigo-700 hover:bg-indigo-700 hover:text-white",
				webdev:
					"border-transparent text-purple-600 hover:bg-purple-600 hover:text-white",
				backend:
					"border-transparent text-rose-500 hover:bg-rose-500 hover:text-white",
				frontend:
					"border-transparent text-violet-500 hover:bg-violet-500 hover:text-white",
				opensource:
					"border-transparent text-cyan-600 hover:bg-cyan-600 hover:text-white",
				devops:
					"border-transparent text-teal-600 hover:bg-teal-600 hover:text-white",
				career:
					"border-transparent text-fuchsia-500 hover:bg-fuchsia-500 hover:text-white",
				learning:
					"border-transparent text-lime-500 hover:bg-lime-500 hover:text-white",
				productivity:
					"border-transparent text-amber-600 hover:bg-amber-600 hover:text-white",
				beginners:
					"border-transparent text-emerald-600 hover:bg-emerald-600 hover:text-white",
				testing:
					"border-transparent text-indigo-600 hover:bg-indigo-600 hover:text-white",
				design:
					"border-transparent text-pink-400 hover:bg-pink-400 hover:text-white",
				ux: "border-transparent text-violet-600 hover:bg-violet-600 hover:text-white",
				ai: "border-transparent text-purple-700 hover:bg-purple-700 hover:text-white",
				machinelearning:
					"border-transparent text-green-800 hover:bg-green-800 hover:text-white",
				datascience:
					"border-transparent text-cyan-700 hover:bg-cyan-700 hover:text-white",
				security:
					"border-transparent text-red-700 hover:bg-red-700 hover:text-white",
				encryption:
					"border-transparent text-emerald-700 hover:bg-emerald-700 hover:text-white",
				serverless:
					"border-transparent text-purple-700 hover:bg-purple-700 hover:text-white",
				cloud:
					"border-transparent text-blue-700 hover:bg-blue-700 hover:text-white",
				ci: "border-transparent text-yellow-600 hover:bg-yellow-600 hover:text-white",
				cd: "border-transparent text-yellow-700 hover:bg-yellow-700 hover:text-white",
				blockchain:
					"border-transparent text-indigo-700 hover:bg-indigo-700 hover:text-white",
				nft: "border-transparent text-pink-600 hover:bg-pink-600 hover:text-white",
				crypto:
					"border-transparent text-amber-700 hover:bg-amber-700 hover:text-white",
				webassembly:
					"border-transparent text-cyan-700 hover:bg-cyan-700 hover:text-white",
				pwa: "border-transparent text-teal-700 hover:bg-teal-700 hover:text-white",
				restapi:
					"border-transparent text-green-700 hover:bg-green-700 hover:text-white",
				microservices:
					"border-transparent text-rose-700 hover:bg-rose-700 hover:text-white",
				observability:
					"border-transparent text-orange-700 hover:bg-orange-700 hover:text-white",
				monitoring:
					"border-transparent text-blue-800 hover:bg-blue-800 hover:text-white",
				logging:
					"border-transparent text-gray-800 hover:bg-gray-800 hover:text-white",
				analytics:
					"border-transparent text-lime-700 hover:bg-lime-700 hover:text-white",
				bigdata:
					"border-transparent text-amber-800 hover:bg-amber-800 hover:text-white",
				elasticsearch:
					"border-transparent text-orange-800 hover:bg-orange-800 hover:text-white",
				redis:
					"border-transparent text-red-800 hover:bg-red-800 hover:text-white",
				postgres:
					"border-transparent text-blue-800 hover:bg-blue-800 hover:text-white",
				mysql:
					"border-transparent text-indigo-800 hover:bg-indigo-800 hover:text-white",
				sqlite:
					"border-transparent text-violet-700 hover:bg-violet-700 hover:text-white",
				artificialintelligence:
					"border-transparent text-purple-800 hover:bg-purple-800 hover:text-white",
				deeplearning:
					"border-transparent text-fuchsia-700 hover:bg-fuchsia-700 hover:text-white",
				reinforcementlearning:
					"border-transparent text-emerald-800 hover:bg-emerald-800 hover:text-white",
				devcommunity:
					"border-transparent text-sky-700 hover:bg-sky-700 hover:text-white",
				mentoring:
					"border-transparent text-lime-600 hover:bg-lime-600 hover:text-white",
				hackathon:
					"border-transparent text-rose-600 hover:bg-rose-600 hover:text-white",
				codingchallenge:
					"border-transparent text-pink-500 hover:bg-pink-500 hover:text-white",
				freelancing:
					"border-transparent text-orange-600 hover:bg-orange-600 hover:text-white",
				startup:
					"border-transparent text-cyan-600 hover:bg-cyan-600 hover:text-white",
				entrepreneurship:
					"border-transparent text-yellow-700 hover:bg-yellow-700 hover:text-white",
				leadership:
					"border-transparent text-indigo-600 hover:bg-indigo-600 hover:text-white",
				documentation:
					"border-transparent text-gray-700 hover:bg-gray-700 hover:text-white",
				api: "border-transparent text-emerald-600 hover:bg-emerald-600 hover:text-white",
				cli: "border-transparent text-slate-600 hover:bg-slate-600 hover:text-white",
				desktop:
					"border-transparent text-stone-600 hover:bg-stone-600 hover:text-white",
				mobile:
					"border-transparent text-indigo-500 hover:bg-indigo-500 hover:text-white",
				system:
					"border-transparent text-gray-600 hover:bg-gray-600 hover:text-white",
				web: "border-transparent text-blue-500 hover:bg-blue-500 hover:text-white",
				parse:
					"border-transparent text-purple-500 hover:bg-purple-500 hover:text-white",

				// Post status colors
				published: "border-transparent bg-green-700 text-white",
				draft: "border-transparent bg-yellow-500 text-black",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
