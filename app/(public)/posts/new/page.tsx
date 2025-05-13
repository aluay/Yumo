import PageLayout from "@/components/layouts/PageLayout";
import PostForm from "@/components/shared/PostForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewPostPage() {
	const session = await auth();

	// if user is not signed in, redirect to homepage
	if (!session?.user) {
		redirect("/");
	}

	return (
		<PageLayout>
			<div className="max-w-2xl mx-auto">
				<h1 className="text-2xl font-semibold mb-6">Create New Post</h1>
				<PostForm />
			</div>
		</PageLayout>
	);
}
