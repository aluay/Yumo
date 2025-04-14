"use client";
import { useState, useEffect } from "react";
import { getScripts } from "@/lib/api/api";
import { scriptPayloadSchemaType } from "@/lib/schemas/scriptSchema";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ThumbsUp, Eye } from "lucide-react";
import { formatNumber, truncateText } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getSafeVariant } from "@/lib/languageVariants";

const ScriptsMiniList = () => {
	const [scripts, setScripts] = useState<scriptPayloadSchemaType[]>([]);

	useEffect(() => {
		getScripts().then((data) => setScripts(data));
	}, []);

	return (
		<>
			<h1 className="inline-block mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
				Latest Posts
			</h1>
			<div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full mx-auto mb-4">
				{scripts.map((script) => (
					<Card
						key={script.id}
						className="flex flex-col justify-between hover:border-zinc-500">
						<CardHeader className="p-4 pb-0">
							<CardTitle className="flex items-center justify-between font-normal text-[18px]">
								<Link href={`/api/script/${script.id}`}>{script.title}</Link>
								<span className="text-xs text-muted-foreground leading-none">
									{moment(script.createdAt).fromNow()}
								</span>
							</CardTitle>
							<CardDescription>
								{truncateText(script.description ?? "", 100)}
							</CardDescription>
						</CardHeader>

						<CardContent className="flex justify-between items-center p-4">
							<div className="flex flex-wrap gap-1">
								<Badge variant={getSafeVariant(script.language.toLowerCase())}>
									{script.language}
								</Badge>

								{script.tags?.map((tag, index) => (
									<Badge key={index} variant="outline">
										{tag}
									</Badge>
								))}
							</div>
						</CardContent>

						<CardFooter className="border-t px-4 py-3 flex items-center justify-between">
							<div className="flex items-center gap-2 leading-none">
								<Avatar className="h-[24px] w-[24px]">
									{script.author?.image ? (
										<AvatarImage
											src={script.author.image}
											alt={script.author.name}
										/>
									) : (
										<AvatarFallback>
											{script.author?.name.charAt(0)}
										</AvatarFallback>
									)}
								</Avatar>
								<span className="text-[14px]">{script.author?.name}</span>
							</div>
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-1">
									<ThumbsUp className="h-4 w-4" />
									<span className="text-xs text-muted-foreground leading-none">
										{formatNumber(script.likes)}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Eye className="h-4 w-4" />
									<span className="text-xs text-muted-foreground leading-none">
										{formatNumber(script.views)}
									</span>
								</div>
							</div>
						</CardFooter>
					</Card>
				))}
			</div>
		</>
	);
};

export default ScriptsMiniList;
