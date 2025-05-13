import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PageLayout from "@/components/layouts/PageLayout";
import ProfileForm from "@/components/shared/ProfileForm";
import { getUserProfile } from "@/lib/api/api";

export default async function EditProfilePage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = await params;
	const numericUserId = Number(userId);
	const session = await auth();
	if (!session?.user) redirect("/");

	if (isNaN(numericUserId)) {
		notFound();
	}

	const profile = await getUserProfile(numericUserId);

	if (!profile) notFound();

	return (
		<PageLayout>
			<div className="max-w-2xl mx-auto pb-10">
				<h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>
				<ProfileForm defaultValues={profile} userId={numericUserId} />
			</div>
		</PageLayout>
	);
}
