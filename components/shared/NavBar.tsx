import { ModeToggle } from "@/components/shared/ModeToggle";
import Link from "next/link";
import SignInButton from "../auth/SignInButton";

export default function NavBar() {
	return (
		<nav className="w-full flex items-center justify-between">
			<Link href="/">ScriptHub</Link>
			<div className="flex gap-4">
				<ModeToggle />
				<div className="hidden lg:block">
					<SignInButton />
				</div>
			</div>
		</nav>
	);
}
