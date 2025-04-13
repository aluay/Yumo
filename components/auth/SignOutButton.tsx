"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function SignOutButton() {
	const { data: session } = useSession();

	if (!session) return null;
	return (
		<Button size="sm" onClick={() => signOut()}>
			Sign Out
		</Button>
	);
}
