import Providers from "@web/components/providers";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../index.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "broken-experiences",
	description: "broken-experiences",
};

export default async function RootLayout(props: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<Providers>
					<div className="flex min-h-dvh w-full flex-col">
						<main className="relative min-h-0 w-full flex-1">
							{props.children}
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
