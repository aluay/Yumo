"use client";
import { ModeToggle } from "@/components/shared/ModeToggle";
import Link from "next/link";
import SignInButton from "../auth/SignInButton";
import SignOutButton from "../auth/SignOutButton";
import { useSession } from "next-auth/react";

export default function NavBar() {
	const { data: session } = useSession();

	return (
		<nav className="w-full flex items-center justify-between">
			<Link href="/">ScriptHub</Link>
			<div className="flex gap-4">
				<ModeToggle />
				<div className="hidden lg:block">
					{session?.user ? <SignOutButton /> : <SignInButton />}
				</div>
			</div>
		</nav>
	);
}
