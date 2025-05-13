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
				<Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all duration-150">
					<AvatarImage src={user.image || ""} alt={user.name} />
					<AvatarFallback>{user.name[0]}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 p-0 overflow-hidden shadow-lg border-border">
				{/* User info header */}
				<div className="p-3 border-b bg-muted/50">
					<div className="font-medium">{user.name}</div>
					<div className="text-xs text-muted-foreground mt-0.5">
						View and edit your profile
					</div>
				</div>

				{/* Menu items */}
				<div className="p-1.5">
					<DropdownMenuItem
						onClick={() => router.push("/")}
						className="flex items-center gap-2.5 py-2 cursor-pointer">
						<House className="h-4 w-4" />
						<span>Home</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => router.push(`/users/${user.id}`)}
						className="flex items-center gap-2.5 py-2 cursor-pointer">
						<User className="h-4 w-4" />
						<span>Profile</span>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => router.push("/posts/new")}
						className="flex items-center gap-2.5 py-2 cursor-pointer">
						<PlusCircle className="h-4 w-4" />
						<span>New Post</span>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={() => signOut()}
						className="flex items-center gap-2.5 py-2 cursor-pointer text-destructive hover:text-destructive">
						<LogOut className="h-4 w-4" />
						<span>Log out</span>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
