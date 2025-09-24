import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers";
import "../index.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "broken-experiences",
	description: "broken-experiences",
};

export default function RootLayout(props: LayoutProps<'/'>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<div className="flex h-dvh w-full flex-col">
						<main className="relative min-h-0 w-full flex-1">
							{props.children}
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
