import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PageLayout from "@/components/layouts/PageLayout";
import PostForm from "@/components/shared/PostForm";
import { getPostById } from "@/lib/api/api";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug?: string }>;
}) {
	const { slug = "" } = await params;
	const [id] = slug.split("-");
	const numericPostId = Number(id);
	if (isNaN(numericPostId)) return {};
	const post = await getPostById(numericPostId);
	if (!post) return {};
	return {
		title: `Yumo | ${post.title}`,
		description: post.description,
	};
}

export default async function EditPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug = "" } = await params;
	const [id] = slug.split("-");
	const numericPostId = Number(id);

	const session = await auth();
	if (!session?.user) redirect("/");

	if (isNaN(numericPostId)) notFound();
	const post = await getPostById(numericPostId);
	if (!post) notFound();

	return (
		<PageLayout>
			<PostForm defaultValues={post} />
		</PageLayout>
	);
}
