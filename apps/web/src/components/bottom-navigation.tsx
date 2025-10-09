"use client";

import { useAuth } from "@web/components/auth-provider";
import { useCamera } from "@web/context/CameraContext";
import { Home, MapPin, Search, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	requiresAuth?: boolean;
}

const navItems: NavItem[] = [
	{
		href: "/home",
		icon: Home,
		label: "Home",
	},
	{
		href: "/search",
		icon: Search,
		label: "Search",
	},
	{
		href: "/map",
		icon: MapPin,
		label: "Map",
	},
	{
		href: "/leaderboard",
		icon: Trophy,
		label: "Leaderboard",
	},
	{
		href: "/profile",
		icon: User,
		label: "Profile",
		requiresAuth: true,
	},
];

export function BottomNavigation() {
	const pathname = usePathname();
	const { user } = useAuth();
	const { isCameraActive } = useCamera();

	const isActive = (href: string) => {
		if (href === "/home") {
			return pathname === "/" || pathname === "/home";
		}
		return pathname === href || pathname.startsWith(href + "/");
	};

	// Hide bottom navigation when camera is active
	if (isCameraActive) {
		return null;
	}

	return (
		<div className="fixed right-0 bottom-0 left-0 z-40 lg:hidden">
			{/* Background with blur effect */}
			<div className="absolute inset-0 border-gray-200 border-t bg-white/95 backdrop-blur-md" />

			{/* Navigation items */}
			<nav className="relative flex h-16 items-center justify-around px-2">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.href);

					// Skip items that require auth if user is not logged in
					if (item.requiresAuth && !user) {
						return null;
					}

					return (
						<Link
							key={item.href}
							href={item.href as any}
							className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center py-2 transition-all duration-200 ease-out ${
								active
									? "text-black"
									: "text-gray-600 hover:text-gray-900 active:scale-95"
							}
                            `}
						>
							<div
								className={`flex items-center justify-center transition-all duration-200 ease-out ${
									active
										? "-translate-y-0.5 scale-110 transform"
										: "translate-y-0 transform"
								}
                            `}
							>
								{/* Special handling for profile to show avatar */}
								{item.href === "/profile" && user ? (
									<div
										className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-200 ${
											active
												? "border-black bg-gray-100"
												: "border-gray-300 bg-gray-200"
										}
                                    `}
									>
										{user?.user_metadata?.avatar_url ? (
											<img
												src={user.user_metadata.avatar_url}
												alt="Profile"
												className="h-full w-full rounded-full object-cover"
											/>
										) : (
											<span className="font-semibold text-gray-600 text-xs">
												{user?.user_metadata?.name?.charAt(0) ||
													user?.email?.charAt(0) ||
													"U"}
											</span>
										)}
									</div>
								) : (
									<Icon
										className={`h-6 w-6 transition-all duration-200 ${
											active ? "fill-current stroke-2" : "stroke-2"
										}
                                        `}
									/>
								)}
							</div>

							{/* Label */}
							<span
								className={`mt-1 font-medium text-xs transition-all duration-200 ${
									active ? "font-semibold text-black" : "text-gray-500"
								}
                            `}
							>
								{item.label}
							</span>

							{/* Active indicator dot */}
							{active && (
								<div className="absolute top-1 h-1 w-1 rounded-full bg-black" />
							)}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
