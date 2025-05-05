import { auth } from "@/app/auth";
import { notFound, redirect } from "next/navigation";
import PageLayout from "@/components/layouts/PageLayout";
import PostForm from "@/components/shared/PostForm";
import { getPostById } from "@/lib/api/api";

export default async function EditPostPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await auth();
	if (!session?.user) redirect("/");

	const post = await getPostById(Number(id), Number(session?.user?.id));

	if (!post) notFound();

	return (
		<PageLayout>
			<div className="max-w-2xl mx-auto py-10">
				<h1 className="text-2xl font-semibold mb-6">Edit Post</h1>
				<PostForm defaultValues={post} />
			</div>
		</PageLayout>
	);
}
