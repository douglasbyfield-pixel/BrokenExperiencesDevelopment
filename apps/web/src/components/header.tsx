"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/home", label: "Home" },
		{ to: "/map", label: "Map" },
		{ to: "/report", label: "Report" },
		{ to: "/profile", label: "Profile" },
	] as const;

	return (
		<div className="border-gray-200 border-b bg-white">
			<div className="flex flex-row items-center justify-between px-2 py-1 sm:py-2">
				<nav className="flex gap-2 text-sm sm:gap-4 sm:text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link
								key={to}
								href={to}
								className="text-black transition-colors hover:text-gray-600"
							>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-1 sm:gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</div>
	);
}
