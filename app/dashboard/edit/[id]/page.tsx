import { auth } from "@/app/auth";
import { notFound, redirect } from "next/navigation";
import PageLayout from "@/components/layouts/PageLayout";
import ScriptForm from "@/components/shared/ScriptForm";
import { getScriptById } from "@/lib/api/api";

export default async function EditScriptPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await auth();
	if (!session?.user) redirect("/");

	const script = await getScriptById(Number(id), Number(session?.user?.id));
	if (!script) notFound();

	return (
		<PageLayout>
			<div className="max-w-2xl mx-auto py-10">
				<h1 className="text-2xl font-semibold mb-6">Edit Script</h1>
				<ScriptForm defaultValues={script} />
			</div>
		</PageLayout>
	);
}
