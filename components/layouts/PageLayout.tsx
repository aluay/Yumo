import NavBar from "@/components/shared/NavBar";

export default function PageLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<header className="fixed top-0 z-50 w-full border-b bg-background">
				<div className="mx-auto w-full px-4 flex items-center justify-between h-12">
					<NavBar />
				</div>
			</header>

			<main className="pt-20 mx-auto w-full max-w-[860px] px-4 py-8">
				{children}
			</main>
		</div>
	);
}
