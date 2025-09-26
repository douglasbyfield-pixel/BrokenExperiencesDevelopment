import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalHeader from "@/components/conditional-header";
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

export default function RootLayout(props: LayoutProps<"/">) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<ConditionalHeader>{props.children}</ConditionalHeader>
				</Providers>
			</body>
		</html>
	);
}
