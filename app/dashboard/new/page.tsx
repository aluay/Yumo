import PageLayout from "@/components/layouts/PageLayout";
import ScriptForm from "@/components/shared/ScriptForm";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";

export default async function NewScriptPage() {
	const session = await auth();

	// if user is not signed in, redirect to homepage
	if (!session?.user) {
		console.log("User is not signed in");
		redirect("/");
	}

	return (
		<PageLayout>
			<div className="max-w-2xl mx-auto py-10">
				<h1 className="text-2xl font-semibold mb-6">Create a New Script</h1>
				<ScriptForm />
			</div>
		</PageLayout>
	);
}
