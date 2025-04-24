import { notFound } from "next/navigation";
import CodeViewer from "@/components/shared/CodeViewer";
import RichContentViewer from "@/components/shared/RichContentViewer";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { JSONContent } from "@tiptap/react";
import { getScriptById } from "@/lib/api/api";
import PageLayout from "@/components/layouts/PageLayout";
import { getSafeVariant } from "@/lib/badgeVariants";
import { auth } from "@/app/auth";
import LikeButton from "@/components/shared/LikeScriptButton";
import CommentThread from "@/components/shared/CommentThread";

export default async function ScriptViewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await auth();
	const script = await getScriptById(Number(id));
	if (!script) notFound();

	// If a user tries to access /script/[id] and it's a draft and they're not the author, they see a 404 page.
	if (script.status === "DRAFT" && session?.user?.id !== script.authorId) {
		return notFound();
	}

	const userHasLiked =
		script.likedBy?.some((user) => user.id === session?.user?.id) ?? false;

	if (Number(session?.user.id) === script.authorId) {
		console.log("WEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
	}
	return (
		<PageLayout>
			<div className="space-y-6">
				<h1 className="text-3xl font-bold">{script.title}</h1>

				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					{script.author?.image && (
						<Image
							src={script.author.image}
							alt="author"
							width={32}
							height={32}
							className="rounded-full"
						/>
					)}
					<span>{script.author?.name ?? "Unknown Author"}</span>
					<span>·</span>
					<span>{new Date(script.createdAt).toLocaleDateString()}</span>
					<span>·</span>
					<span>{script.views} views</span>
					<LikeButton
						scriptId={script.id}
						initialLiked={userHasLiked}
						initialCount={script.likedBy?.length ?? 0}
					/>
					{Number(session?.user.id) === script.authorId && (
						<Badge variant={getSafeVariant(script.status.toLowerCase())}>
							{script.status}
						</Badge>
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge variant={getSafeVariant(script.language.toLowerCase())}>
						{script.language}
					</Badge>
					{script.tags.map((tag) => (
						<Badge key={tag} variant="outline">
							{tag}
						</Badge>
					))}
				</div>

				{script.description && (
					<p className="text-muted-foreground">{script.description}</p>
				)}

				<div>
					{/* <h2 className="text-lg font-semibold mb-2">Code</h2> */}
					<CodeViewer code={script.code} language={script.language} />
				</div>

				{script.content && (
					<div>
						{/* <h2 className="text-lg font-semibold mt-6 mb-2">Notes</h2> */}
						<RichContentViewer content={script.content as JSONContent} />
					</div>
				)}
				<CommentThread scriptId={script.id} />
			</div>
		</PageLayout>
	);
}
