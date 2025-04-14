import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import UserScripts from "@/components/shared/UserScripts";
import PageLayout from "@/components/layouts/PageLayout";

const Dashboard = async () => {
	const session = await auth();

	// if user is not signed in, redirect to homepage
	if (!session?.user) {
		console.log("User is not signed in");
		redirect("/");
	}

	return (
		<PageLayout>
			<UserScripts userId={Number(session.user.id)} />
		</PageLayout>
	);
};

export default Dashboard;
