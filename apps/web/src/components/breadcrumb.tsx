"use client";
import { ChevronRight, Home } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
	const pathname = usePathname();

	// Auto-generate breadcrumbs from pathname if items not provided
	const defaultItems = React.useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/home" }];

		segments.forEach((segment, index) => {
			if (segment === "core") return; // Skip core segment

			const href = "/" + segments.slice(0, index + 1).join("/");
			const label = segment.charAt(0).toUpperCase() + segment.slice(1);

			breadcrumbs.push({
				label,
				href: index === segments.length - 1 ? undefined : href,
			});
		});

		return breadcrumbs;
	}, [pathname]);

	const breadcrumbs = items || defaultItems;

	if (breadcrumbs.length <= 1) return null;

	return (
		<nav className="mb-6 flex items-center space-x-2 text-gray-600 text-sm">
			{breadcrumbs.map((item, index) => (
				<div key={index} className="flex items-center space-x-2">
					{index > 0 && <ChevronRight className="h-4 w-4" />}
					{item.href ? (
						<Link
							href={item.href as Route}
							className="transition-colors hover:text-black"
						>
							{index === 0 && <Home className="mr-1 inline h-4 w-4" />}
							{item.label}
						</Link>
					) : (
						<span className="font-medium text-black">{item.label}</span>
					)}
				</div>
			))}
		</nav>
	);
}
