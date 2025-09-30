"use client";

import { authClient } from "@web/lib/auth-client";
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
	const { data: session, isPending } = authClient.useSession();

	const shouldHideHeader = HIDE_HEADER_ROUTES.includes(pathname);

	// Always hide header on auth routes and map page
	if (shouldHideHeader) {
		return <div className="h-svh">{children}</div>;
	}

	// Don't show header if user is not logged in (except on auth routes which are already handled above)
	if (!isPending && !session) {
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
