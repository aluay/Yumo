import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PageLayout from "@/components/layouts/PageLayout";
import PostForm from "@/components/shared/PostForm";
import { getPostById } from "@/lib/api/api";

export default async function EditPostPage({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;
	const numericPostId = Number(postId);
	const session = await auth();
	if (!session?.user) redirect("/");

	if (isNaN(numericPostId)) {
		notFound();
	}

	const post = await getPostById(numericPostId);

	if (!post) notFound();

	return (
		<PageLayout>
			<div className="max-w-2xl mx-auto pb-10">
				<h1 className="text-2xl font-semibold mb-6">Edit Post</h1>
				<PostForm defaultValues={post} />
			</div>
		</PageLayout>
	);
}
