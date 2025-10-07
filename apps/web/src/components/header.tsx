"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/home", label: "Home" },
		{ to: "/map", label: "Map" },
		{ to: "/profile", label: "Profile" },
		{ to: "/leaderboard", label: "Leaderboard" },
		{ to: "/achievements", label: "Achievements" },
		{ to: "/settings", label: "Settings" },
	] as const;

	return (
		<div className="sticky top-0 z-50 border-gray-100 border-b bg-white/95 backdrop-blur-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-8">
						<Link
							href="/home"
							className="font-semibold text-black text-xl transition-colors hover:text-gray-700"
						>
							Broken Experiences
						</Link>
						<nav className="hidden space-x-6 md:flex">
							{links.map(({ to, label }) => {
								return (
									<Link
										key={to}
										href={to}
										className="group relative font-medium text-gray-700 transition-colors duration-200 hover:text-black"
									>
										{label}
										<span className="absolute bottom-0 left-0 h-0.5 w-0 bg-black transition-all duration-200 group-hover:w-full" />
									</Link>
								);
							})}
						</nav>
					</div>
					<div className="flex items-center space-x-3">
						<ModeToggle />
						<UserMenu />
					</div>
				</div>
			</div>
		</div>
	);
}
