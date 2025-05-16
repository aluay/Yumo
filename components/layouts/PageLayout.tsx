import NavBar from "@/components/shared/NavBar";

export default function PageLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			{" "}
			<header className="fixed top-0 z-50 w-full border-b bg-background">
				<div className="mx-auto w-full px-4 flex items-center justify-between h-12">
					<NavBar />
				</div>
			</header>
			<main className="pt-24 w-full px-4 sm:px-6 lg:px-8 py-8">{children}</main>
		</div>
	);
}
