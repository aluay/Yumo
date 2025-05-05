import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground",

				// Tag colors
				javascript: "text-yellow-500 hover:bg-yellow-500 hover:text-white",
				typescript: "text-blue-500 hover:bg-blue-500 hover:text-white",
				python: "text-green-500 hover:bg-green-500 hover:text-white",
				ruby: "text-red-500 hover:bg-red-500 hover:text-white",
				java: "text-orange-500 hover:bg-orange-500 hover:text-white",
				go: "text-cyan-500 hover:bg-cyan-500 hover:text-white",
				rust: "text-orange-600 hover:bg-orange-600 hover:text-white",
				php: "text-indigo-500 hover:bg-indigo-500 hover:text-white",
				csharp: "text-purple-500 hover:bg-purple-500 hover:text-white",
				react: "text-sky-500 hover:bg-sky-500 hover:text-white",
				vue: "text-emerald-500 hover:bg-emerald-500 hover:text-white",
				angular: "text-red-600 hover:bg-red-600 hover:text-white",
				svelte: "text-pink-500 hover:bg-pink-500 hover:text-white",
				nextjs: "text-gray-800 hover:bg-gray-800 hover:text-white",
				node: "text-green-600 hover:bg-green-600 hover:text-white",
				tailwindcss: "text-teal-500 hover:bg-teal-500 hover:text-white",
				css: "text-blue-400 hover:bg-blue-400 hover:text-white",
				html: "text-orange-400 hover:bg-orange-400 hover:text-white",
				graphql: "text-pink-600 hover:bg-pink-600 hover:text-white",
				docker: "text-blue-600 hover:bg-blue-600 hover:text-white",
				kubernetes: "text-blue-700 hover:bg-blue-700 hover:text-white",
				git: "text-red-600 hover:bg-red-600 hover:text-white",
				github: "text-gray-700 hover:bg-gray-700 hover:text-white",
				vscode: "text-indigo-600 hover:bg-indigo-600 hover:text-white",
				linux: "text-yellow-600 hover:bg-yellow-600 hover:text-white",
				aws: "text-orange-500 hover:bg-orange-500 hover:text-white",
				firebase: "text-amber-500 hover:bg-amber-500 hover:text-white",
				mongodb: "text-green-700 hover:bg-green-700 hover:text-white",
				sql: "text-indigo-700 hover:bg-indigo-700 hover:text-white",
				webdev: "text-purple-600 hover:bg-purple-600 hover:text-white",
				backend: "text-rose-500 hover:bg-rose-500 hover:text-white",
				frontend: "text-violet-500 hover:bg-violet-500 hover:text-white",
				opensource: "text-cyan-600 hover:bg-cyan-600 hover:text-white",
				devops: "text-teal-600 hover:bg-teal-600 hover:text-white",
				career: "text-fuchsia-500 hover:bg-fuchsia-500 hover:text-white",
				learning: "text-lime-500 hover:bg-lime-500 hover:text-white",
				productivity: "text-amber-600 hover:bg-amber-600 hover:text-white",
				beginners: "text-emerald-600 hover:bg-emerald-600 hover:text-white",
				testing: "text-indigo-600 hover:bg-indigo-600 hover:text-white",
				design: "text-pink-400 hover:bg-pink-400 hover:text-white",
				ux: "text-violet-600 hover:bg-violet-600 hover:text-white",
				ai: "text-purple-700 hover:bg-purple-700 hover:text-white",
				machinelearning: "text-green-800 hover:bg-green-800 hover:text-white",
				datascience: "text-cyan-700 hover:bg-cyan-700 hover:text-white",
				security: "text-red-700 hover:bg-red-700 hover:text-white",
				encryption: "text-emerald-700 hover:bg-emerald-700 hover:text-white",
				serverless: "text-purple-700 hover:bg-purple-700 hover:text-white",
				cloud: "text-blue-700 hover:bg-blue-700 hover:text-white",
				ci: "text-yellow-600 hover:bg-yellow-600 hover:text-white",
				cd: "text-yellow-700 hover:bg-yellow-700 hover:text-white",
				blockchain: "text-indigo-700 hover:bg-indigo-700 hover:text-white",
				nft: "text-pink-600 hover:bg-pink-600 hover:text-white",
				crypto: "text-amber-700 hover:bg-amber-700 hover:text-white",
				webassembly: "text-cyan-700 hover:bg-cyan-700 hover:text-white",
				pwa: "text-teal-700 hover:bg-teal-700 hover:text-white",
				restapi: "text-green-700 hover:bg-green-700 hover:text-white",
				microservices: "text-rose-700 hover:bg-rose-700 hover:text-white",
				observability: "text-orange-700 hover:bg-orange-700 hover:text-white",
				monitoring: "text-blue-800 hover:bg-blue-800 hover:text-white",
				logging: "text-gray-800 hover:bg-gray-800 hover:text-white",
				analytics: "text-lime-700 hover:bg-lime-700 hover:text-white",
				bigdata: "text-amber-800 hover:bg-amber-800 hover:text-white",
				elasticsearch: "text-orange-800 hover:bg-orange-800 hover:text-white",
				redis: "text-red-800 hover:bg-red-800 hover:text-white",
				postgres: "text-blue-800 hover:bg-blue-800 hover:text-white",
				mysql: "text-indigo-800 hover:bg-indigo-800 hover:text-white",
				sqlite: "text-violet-700 hover:bg-violet-700 hover:text-white",
				artificialintelligence:
					"text-purple-800 hover:bg-purple-800 hover:text-white",
				deeplearning: "text-fuchsia-700 hover:bg-fuchsia-700 hover:text-white",
				reinforcementlearning:
					"text-emerald-800 hover:bg-emerald-800 hover:text-white",
				devcommunity: "text-sky-700 hover:bg-sky-700 hover:text-white",
				mentoring: "text-lime-600 hover:bg-lime-600 hover:text-white",
				hackathon: "text-rose-600 hover:bg-rose-600 hover:text-white",
				codingchallenge: "text-pink-500 hover:bg-pink-500 hover:text-white",
				freelancing: "text-orange-600 hover:bg-orange-600 hover:text-white",
				startup: "text-cyan-600 hover:bg-cyan-600 hover:text-white",
				entrepreneurship:
					"text-yellow-700 hover:bg-yellow-700 hover:text-white",
				leadership: "text-indigo-600 hover:bg-indigo-600 hover:text-white",
				documentation: "text-gray-700 hover:bg-gray-700 hover:text-white",
				api: "text-emerald-600 hover:bg-emerald-600 hover:text-white",
				cli: "text-slate-600 hover:bg-slate-600 hover:text-white",
				desktop: "text-stone-600 hover:bg-stone-600 hover:text-white",
				mobile: "text-indigo-500 hover:bg-indigo-500 hover:text-white",
				system: "text-gray-600 hover:bg-gray-600 hover:text-white",
				web: "text-blue-500 hover:bg-blue-500 hover:text-white",
				parse: "text-purple-500 hover:bg-purple-500 hover:text-white",

				// Post status colors
				published: "bg-green-700 text-white",
				draft: "bg-yellow-500 text-black",
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
