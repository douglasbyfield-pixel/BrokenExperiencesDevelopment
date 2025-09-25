"use client";
import { usePathname } from "next/navigation";
import { useSupabaseSession } from "@/lib/use-supabase-session";
import Header from "./header";
import type { ReactNode } from "react";

const HIDE_HEADER_ROUTES = [
	"/login",
	"/forgot-password",
	"/reset-password",
	"/verify",
	"/map", // Hide navbar on map page for full-screen experience
];

interface ConditionalHeaderProps {
	children: ReactNode;
}

export default function ConditionalHeader({ children }: ConditionalHeaderProps) {
	const pathname = usePathname();
	const { user, loading } = useSupabaseSession();
	
	const shouldHideHeader = HIDE_HEADER_ROUTES.includes(pathname);
	
	// Always hide header on auth routes and map page
	if (shouldHideHeader) {
		return (
			<div className="h-svh">
				{children}
			</div>
		);
	}
	
	// Don't show header if user is not logged in (except on auth routes which are already handled above)
	if (!loading && !user) {
		return (
			<div className="h-svh">
				{children}
			</div>
		);
	}

	// Show header for logged-in users on non-restricted routes
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			{children}
		</div>
	);
}