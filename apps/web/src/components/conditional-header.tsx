"use client";
import { usePathname } from "next/navigation";
import Header from "./header";
import type { ReactNode } from "react";

const HIDE_HEADER_ROUTES = [
	"/login",
	"/forgot-password",
	"/reset-password",
	"/verify",
];

interface ConditionalHeaderProps {
	children?: ReactNode;
}

export default function ConditionalHeader({ children }: ConditionalHeaderProps) {
	const pathname = usePathname();
	const shouldHideHeader = HIDE_HEADER_ROUTES.includes(pathname);

	if (shouldHideHeader) {
		return (
			<div className="h-svh">
				{children}
			</div>
		);
	}

	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			{children}
		</div>
	);
}