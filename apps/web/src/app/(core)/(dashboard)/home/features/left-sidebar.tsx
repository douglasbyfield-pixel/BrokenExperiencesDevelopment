"use client";

import type { User } from "@supabase/supabase-js";
import { useAuth } from "@web/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { useSearch } from "@web/context/SearchContext";
import { cn, getInitials } from "@web/lib/utils";
import {
	Award,
	Home,
	LogOut,
	MapPin,
	Search,
	Settings,
	Trophy,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface LeftSidebarProps {
	className?: string;
}

interface NavItem {
	href: string;
	label: string;
	icon: React.ReactNode;
}

const navigationItems: NavItem[] = [
	{
		href: "/home",
		label: "Home",
		icon: <Home className="h-5 w-5" />,
	},
	{
		href: "/map",
		label: "Map",
		icon: <MapPin className="h-5 w-5" />,
	},
	{
		href: "/profile",
		label: "Profile",
		icon: <UserIcon className="h-5 w-5" />,
	},
	{
		href: "/leaderboard",
		label: "Leaderboard",
		icon: <Trophy className="h-5 w-5" />,
	},
	{
		href: "/achievements",
		label: "Achievements",
		icon: <Award className="h-5 w-5" />,
	},
	{
		href: "/settings",
		label: "Settings",
		icon: <Settings className="h-5 w-5" />,
	},
];

export default function LeftSidebar({ className }: LeftSidebarProps) {
	const { user, signOut } = useAuth();
	const pathname = usePathname();
	const { onSearchChange } = useSearch();
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		onSearchChange(value);
	};

	return (
		<aside
			className={cn(
				"sticky top-0 hidden h-screen w-60 flex-col overflow-y-auto border-gray-100 border-r bg-white/95 backdrop-blur-sm lg:flex lg:w-64 xl:w-72",
				className,
			)}
		>
			<div className="flex h-full flex-col">
				<div className="px-3 py-4 lg:px-4">
					{/* Logo */}
					<div className="mb-6 flex items-center space-x-3 lg:mb-8">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white p-1.5 lg:h-12 lg:w-12">
							<img
								src="/images/logo.png"
								alt="Broken Experiences"
								className="h-full w-full object-contain"
							/>
						</div>
						<h1 className="font-bold text-black text-lg lg:text-xl">
							Broken
							<span className="block text-gray-600 text-sm lg:text-base">
								Experiences
							</span>
						</h1>
					</div>

					{/* Search */}
					<div className="mb-6">
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
							<Input
								placeholder="Search experiences..."
								className="rounded-md border border-gray-200 bg-gray-50/80 py-3 pr-4 pl-10 text-black shadow-sm transition-all placeholder:text-gray-500 focus:border-gray-400 focus:bg-white focus:ring-1 focus:ring-gray-400/20"
								value={searchTerm}
								onChange={handleSearchChange}
							/>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex flex-col gap-1">
						{navigationItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href as any}
									className={cn(
										"flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200",
										isActive
											? "bg-gray-100 text-black shadow-sm"
											: "text-gray-600 hover:translate-x-0.5 hover:bg-gray-50 hover:text-gray-900",
									)}
								>
									<div
										className={cn(
											"transition-colors",
											isActive ? "text-black" : "text-gray-500",
										)}
									>
										{item.icon}
									</div>
									<span className="font-medium">{item.label}</span>
								</Link>
							);
						})}
					</nav>
				</div>

				{/* User Profile - moved to bottom */}
				{user && (
					<div className="mt-auto border-gray-100 border-t p-3 lg:p-4">
						<div className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
							<Avatar className="h-10 w-10">
								<AvatarImage
									src={user?.user_metadata?.avatar_url || undefined}
								/>
								<AvatarFallback className="bg-gray-200 text-gray-700">
									{getInitials(
										user?.user_metadata?.name || user?.email || "User",
									)}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<p className="font-medium text-black text-sm">
									{user?.user_metadata?.name || user?.email}
								</p>
								<p className="truncate text-gray-500 text-xs">{user?.email}</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={signOut}
								className="h-8 w-8 rounded-md p-0 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
								title="Sign out"
							>
								<LogOut className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
