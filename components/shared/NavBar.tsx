"use client";
import { ModeToggle } from "@/components/shared/ModeToggle";
import Link from "next/link";
import SignInButton from "../auth/SignInButton";
import ProfileDropdown from "@/components/shared/ProfileDropdown";
import { useSession } from "next-auth/react";
import SearchBar from "./SearchBar";
import NotificationMenu from "@/components/shared/NotificationMenu";

export default function NavBar() {
	const { data: session } = useSession();

	return (
		<nav className="w-full flex items-center justify-between">
			<Link href="/">ScriptHub</Link>
			<SearchBar />
			<div className="flex items-center gap-4">
				<NotificationMenu />
				<ModeToggle />
				<div>
					{session?.user ? (
						<ProfileDropdown
							user={{
								id: String(session.user.id), // force the id be a string
								name: session.user.name!,
								image: session.user.image ?? undefined,
							}}
						/>
					) : (
						<SignInButton />
					)}
				</div>
			</div>
		</nav>
	);
}
