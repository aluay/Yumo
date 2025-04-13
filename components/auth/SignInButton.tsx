"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInButton() {
	// Handle sign in
	const handleSignIn = async () => {
		const result = await signIn("google", { callbackUrl: "/" });
		if (result?.error) {
			console.error(result.error);
		}
	};

	return (
		<Button size="sm" onClick={handleSignIn}>
			Sign In
		</Button>
	);
}
