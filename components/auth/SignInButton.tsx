"use client";
import { signIn } from "next-auth/react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SignInButton({ className, ...props }: ButtonProps) {
	// Handle sign in
	const handleSignIn = async () => {
		const result = await signIn("google", { callbackUrl: "/" });
		if (result?.error) {
			console.error(result.error);
		}
	};
	return (
		<Button
			size="sm"
			onClick={handleSignIn}
			className={cn(
				"font-medium rounded-full px-4 py-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary",
				className
			)}
			{...props}>
			Sign In With Google
		</Button>
	);
}
