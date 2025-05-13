"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, House, PlusCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserDropdown({
	user,
}: {
	user: { id: string; name: string; image?: string | null };
}) {
	const router = useRouter();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="h-8 w-8 cursor-pointer">
					<AvatarImage src={user.image || ""} alt={user.name} />
					<AvatarFallback>{user.name[0]}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="flex flex-col gap-1 w-56 bg-popover text-popover-foreground shadow-md rounded-lg mt-2 p-2">
				<DropdownMenuItem onClick={() => router.push("/")}>
					<House className="h-4 w-4" /> Home
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
					<User className="h-4 w-4" /> Profile
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => router.push("/posts/new")}>
					<PlusCircle className="h-4 w-4" /> New Post
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => signOut()}>
					<LogOut className="h-4 w-4" /> Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
