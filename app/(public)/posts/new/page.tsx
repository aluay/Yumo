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
			<PostForm />
		</PageLayout>
	);
}
