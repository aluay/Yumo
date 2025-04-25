"use client";
import { ModeToggle } from "@/components/shared/ModeToggle";
import Link from "next/link";
import SignInButton from "../auth/SignInButton";
import ProfileDropdown from "@/components/shared/ProfileDropdown";
import { useSession } from "next-auth/react";
import SearchBar from "./SearchBar";

export default function NavBar() {
	const { data: session } = useSession();

	return (
		<nav className="w-full flex items-center justify-between">
			<Link href="/">ScriptHub</Link>
			<div className="flex items-center gap-4">
				<ModeToggle />
				<SearchBar />
				<div>
					{session?.user ? (
						<ProfileDropdown user={session.user} />
					) : (
						<SignInButton />
					)}
				</div>
			</div>
		</nav>
	);
}
