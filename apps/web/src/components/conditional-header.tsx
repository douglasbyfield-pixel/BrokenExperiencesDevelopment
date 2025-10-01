"use client";

import { useAuth } from "@web/components/auth-provider";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./header";

const HIDE_HEADER_ROUTES = [
	"/login",
	"/forgot-password",
	"/reset-password",
	"/verify",
	"/map",
];

interface ConditionalHeaderProps {
	children: ReactNode;
}

export default function ConditionalHeader({
	children,
}: ConditionalHeaderProps) {
	const pathname = usePathname();
	const { user, isLoading } = useAuth();

	const shouldHideHeader = HIDE_HEADER_ROUTES.includes(pathname);

	// Always hide header on auth routes and map page
	if (shouldHideHeader) {
		return <div className="h-svh">{children}</div>;
	}

	// Don't show header if user is not logged in (except on auth routes which are already handled above)
	if (!isLoading && !user) {
		return <div className="h-svh">{children}</div>;
	}

	// Show header for logged-in users on non-restricted routes
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			{children}
		</div>
	);
}
