"use client";
import React, { useState, useEffect } from "react";
import { ModeToggle } from "@/components/shared/ModeToggle";
import Link from "next/link";
import SignInButton from "../auth/SignInButton";
import ProfileDropdown from "@/components/shared/ProfileDropdown";
import { useSession, signOut } from "next-auth/react";
import SearchBar from "./SearchBar";
import NotificationMenu from "@/components/shared/NotificationMenu";
import { Menu, X, Edit, Home, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NavBar() {
	const { data: session } = useSession();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	// Close mobile menu when changing routes
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);
	const navLinks = [
		{ href: "/", label: "Home", icon: <Home /> },
		{ href: "/posts/new", label: "Create", icon: <Edit /> },
		{ href: "/tags", label: "Tags", icon: <Tag /> },
		{ href: "/users", label: "Users", icon: <Users /> },
	];
	return (
		<>
			{" "}
			<nav
				className={cn(
					"fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8",
					"bg-background  border-b border-accent/50 shadow-sm"
				)}>
				<div className="max-w-7xl mx-auto flex items-center justify-between h-14">
					{" "}
					{/* Logo */}
					<div className="flex items-center">
						<Link href="/" className="flex items-center group">
							<div
								className={cn(
									"bg-black text-white dark:bg-white dark:text-black rounded-md font-bold mr-1",
									"px-3 py-1.5 text-lg"
								)}>
								Y
							</div>
							<span
								className={cn(
									"font-bold hidden sm:inline-block group-hover:text-primary",
									"text-xl"
								)}>
								Yumo
							</span>
						</Link>
					</div>
					{/* Desktop Navigation */}
					<div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"text-sm font-medium px-3 py-2 rounded-md flex items-center",
									pathname === link.href
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-accent"
								)}>
								{React.cloneElement(link.icon, { className: "h-4 w-4 mr-2" })}
								{link.label}
							</Link>
						))}
					</div>
					{/* Search Bar - Desktop */}
					<div className="hidden md:block md:flex-1 max-w-md mx-8">
						<SearchBar />
					</div>{" "}
					{/* Right Actions */}
					<div className="flex items-center space-x-2 md:space-x-3">
						<NotificationMenu />
						<ModeToggle />

						{/* Auth */}
						<div className="hidden sm:block">
							{session?.user ? (
								<ProfileDropdown
									user={{
										id: String(session.user.id),
										name: session.user.name!,
										image: session.user.image ?? undefined,
									}}
								/>
							) : (
								<SignInButton />
							)}
						</div>

						{/* Mobile Menu Toggle */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu">
							{mobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>{" "}
			</nav>{" "}
			{/* Mobile Menu */}
			<div
				className={cn(
					"fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden overflow-y-auto",
					mobileMenuOpen ? "block" : "hidden"
				)}
				style={{ top: "3.5rem", height: "calc(100% - 3.5rem)" }}>
				<div className="flex flex-col h-full p-4">
					{/* Mobile Search */}
					<div className="mb-6 sticky top-0 bg-background pt-4 pb-2">
						<SearchBar />
					</div>{" "}
					{/* Mobile Nav Links */}
					<div className="space-y-1.5">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"flex items-center px-4 py-3 text-base font-medium rounded-md",
									pathname === link.href
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								)}>
								<div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-accent/50">
									{React.cloneElement(link.icon, { className: "h-5 w-5" })}
								</div>
								{link.label}
							</Link>
						))}
					</div>
					{/* Mobile Auth (if not shown above) */}
					<div className="mt-auto py-6 border-t sm:hidden">
						{session?.user ? (
							<div className="flex items-center px-4 py-3">
								<div className="flex-shrink-0 mr-3">
									<Avatar className="h-10 w-10 border-2 border-primary/20">
										<AvatarImage
											src={session.user.image || ""}
											alt={session.user.name || "User"}
										/>
										<AvatarFallback className="bg-primary/10 text-primary">
											{session.user.name
												? session.user.name[0].toUpperCase()
												: "U"}
										</AvatarFallback>
									</Avatar>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-foreground truncate">
										{session.user.name}
									</p>
									<div className="flex mt-1 space-x-2">
										{" "}
										<button
											onClick={() => router.push(`/users/${session.user.id}`)}
											className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full bg-accent/50 hover:bg-accent">
											View Profile
										</button>
										<button
											onClick={() => signOut()}
											className="text-xs text-primary hover:text-primary/80 px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20">
											Sign out
										</button>
									</div>
								</div>
							</div>
						) : (
							<div className="px-4 py-3 flex flex-col items-center">
								<p className="text-sm text-muted-foreground mb-2">
									Sign in to get the full experience
								</p>
								<SignInButton />
							</div>
						)}
					</div>
				</div>{" "}
			</div>{" "}
			{/* Content spacer to prevent content from hiding behind fixed navbar */}
			<div className="w-full h-[4.25rem]"></div>
		</>
	);
}
