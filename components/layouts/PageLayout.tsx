import NavBar from "@/components/shared/NavBar";

type PageLayoutProps = {
	children: React.ReactNode;
	sidebarLeft?: React.ReactNode;
	sidebarRight?: React.ReactNode;
};

export default function PageLayout({
	children,
	sidebarLeft,
	sidebarRight,
}: PageLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col bg-accent dark:bg-background">
			<header className="fixed top-0 z-50 w-full border-b bg-background">
				<div className="mx-auto w-full h-12 flex items-center justify-between">
					<NavBar />
				</div>
			</header>

			<div className="flex-grow flex flex-col pt-16 px-4">
				<div className="mx-auto w-full max-w-7xl flex gap-4 py-8">
					{sidebarLeft && (
						<aside className="hidden lg:block w-64">{sidebarLeft}</aside>
					)}

					<main className="flex-1">{children}</main>

					{sidebarRight && (
						<aside className="hidden xl:block w-64 h-fit">{sidebarRight}</aside>
					)}
				</div>
			</div>
		</div>
	);
}
