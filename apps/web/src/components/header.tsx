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
		<div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center space-x-8">
						<Link href="/home" className="text-xl font-semibold text-black hover:text-gray-700 transition-colors">
							Broken Experiences
						</Link>
						<nav className="hidden md:flex space-x-6">
							{links.map(({ to, label }) => {
								return (
									<Link 
										key={to} 
										href={to} 
										className="text-gray-700 hover:text-black font-medium transition-colors duration-200 relative group"
									>
										{label}
										<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-200 group-hover:w-full"></span>
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
