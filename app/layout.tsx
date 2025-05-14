import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import AuthProvider from "@/lib/SessionProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Yumo",
	description:
		"Yumo is a platform for developers to share articles, join discussions, and grow their professional profiles.",
	icons: {
		icon: [
			{ url: "/yumo_logo.png", sizes: "any", type: "image/x-icon" },
			{ url: "/yumo_logo.png", sizes: "32x32", type: "image/png" },
			{ url: "/yumo_logo.png", type: "image/svg+xml" },
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<AuthProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
