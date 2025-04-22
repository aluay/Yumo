"use client";
import { getUserScripts } from "@/lib/api/api";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import moment from "moment";
import Link from "next/link";
import { formatNumber, truncateText } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Eye } from "lucide-react";
import { scriptPayloadSchemaType } from "@/lib/schemas/scriptSchema";
import { getSafeVariant } from "@/lib/languageVariants";

interface UserScriptsProps {
	userId: number;
}

const UserScripts = ({ userId }: UserScriptsProps) => {
	const [scripts, setScripts] = useState<scriptPayloadSchemaType[]>([]);

	useEffect(() => {
		async function fetchUserScripts() {
			try {
				const scriptsData = await getUserScripts(userId);
				setScripts(scriptsData);
			} catch (error) {
				console.error("Error fetching user scripts:", error);
			}
		}
		fetchUserScripts();
	}, [userId]);

	if (scripts.length === 0) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center text-muted-foreground space-y-3">
					<p className="text-base font-medium text-foreground">
						You haven’t created any scripts yet.
					</p>

					<ul className="list-disc list-inside text-sm text-muted-foreground text-left mx-auto w-fit space-y-1">
						<li>Click your profile picture in the top right corner.</li>
						<li>
							Select{" "}
							<span className="text-foreground font-medium">
								&quot;New Script&quot;
							</span>{" "}
							from the menu.
						</li>
						<li>Fill out the form to create and publish your script.</li>
					</ul>
				</div>
			</div>
		);
	}

	return (
		<>
			<h1 className="inline-block mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
				Your Posts
			</h1>
			<div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full mx-auto mb-4">
				{scripts.map((script) => (
					<Card
						key={script.id}
						className="flex flex-col justify-between hover:border-zinc-500">
						<CardHeader className="p-4 pb-0">
							<CardTitle className="flex items-center justify-between font-normal text-[18px]">
								<Link href={`/dashboard/edit/${script.id}`}>
									{script.title}
								</Link>
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

export default UserScripts;
