"use client";

import {
	canInstallPWA,
	triggerPWAInstall,
} from "@web/components/add-to-home-screen";
import { useAuth } from "@web/components/auth-provider";
import { Button } from "@web/components/ui/button";
import { useSearch } from "@web/context/SearchContext";
import { getCategoryStyling } from "@web/lib/category-config";
import { eden } from "@web/lib/eden";
import type { Stats, TrendingCategory, UserStats } from "@web/types";
import {
	Award,
	Download,
	Home,
	LogOut,
	MapPin,
	Menu,
	Search,
	Settings,
	Trophy,
	User as UserIcon,
	X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchInput from "./search-input";

interface MobileNavProps {
	stats?: Stats | null;
	userStats?: UserStats | null;
	trendingCategories?: TrendingCategory[] | null;
}

export default function MobileNav({
	stats,
	userStats,
	trendingCategories,
}: MobileNavProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [categories, setCategories] = useState<
		Array<{ id: string; name: string }>
	>([]);
	const [canInstall, setCanInstall] = useState(false);
	const { signOut, user } = useAuth();
	const { onSearch, onSearchChange, onCategoryFilter } = useSearch();

	// Check if PWA can be installed
	useEffect(() => {
		const interval = setInterval(() => {
			setCanInstall(canInstallPWA());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// Fetch categories from database
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const result = await eden.category.get({
					$query: { limit: 50, offset: 0 },
				});
				if (Array.isArray(result?.data)) {
					// Sort categories alphabetically
					const sorted = result.data.sort((a: any, b: any) =>
						a.name.localeCompare(b.name),
					);
					setCategories(sorted);
				}
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			}
		};

		fetchCategories();
	}, []);

	return (
		<>
			{/* Mobile Header - Hide on small screens, show on medium+ */}
			<div className="sticky top-0 z-50 hidden border-gray-200 border-b bg-white md:block lg:hidden">
				<div className="flex items-center justify-between p-4">
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="rounded-lg p-2 hover:bg-gray-100"
					>
						<Menu className="h-6 w-6" />
					</button>
					<button
						onClick={canInstall ? triggerPWAInstall : undefined}
						className={`flex items-center space-x-2 ${canInstall ? "group cursor-pointer" : "cursor-default"}`}
						title={canInstall ? "Install App" : ""}
					>
						<div
							className={`relative flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white p-1 ${canInstall ? "transition-transform group-hover:scale-110" : ""}`}
						>
							<img
								src="/images/logo.png"
								alt="Broken Experiences"
								className="h-full w-full object-contain"
							/>
							{canInstall && (
								<div className="-top-1 -right-1 absolute flex h-3 w-3 items-center justify-center rounded-full bg-black text-white opacity-60 transition-opacity group-hover:opacity-100">
									<Download className="h-2 w-2" />
								</div>
							)}
						</div>
						<h1 className="font-bold text-black text-lg">
							Broken<span className="text-gray-600">Experiences</span>
						</h1>
					</button>
					<button
						onClick={() => setIsSearchOpen(!isSearchOpen)}
						className="rounded-lg p-2 hover:bg-gray-100"
					>
						<Search className="h-6 w-6" />
					</button>
				</div>
			</div>

			{/* Mobile Menu Overlay (Left Sidebar) */}
			{isMenuOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="absolute inset-0 bg-black bg-opacity-50"
						onClick={() => setIsMenuOpen(false)}
					/>
					<div className="absolute top-0 left-0 h-full w-80 bg-white shadow-xl">
						<div className="border-gray-200 border-b p-4">
							<div className="flex items-center justify-between">
								<h2 className="font-bold text-black text-xl">Navigation</h2>
								<button
									onClick={() => setIsMenuOpen(false)}
									className="rounded-lg p-2 hover:bg-gray-100"
								>
									<X className="h-6 w-6" />
								</button>
							</div>
						</div>
						<nav className="space-y-2 p-4">
							<Link
								href="/home"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black transition-colors hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								<Home className="h-5 w-5" />
								<span className="font-medium">Home</span>
							</Link>
							<Link
								href="/map"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black transition-colors hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								<MapPin className="h-5 w-5" />
								<span className="font-medium">Map</span>
							</Link>
							<Link
								href="/profile"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black transition-colors hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								<UserIcon className="h-5 w-5" />
								<span className="font-medium">Profile</span>
							</Link>
							<Link
								href="/leaderboard"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black transition-colors hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								<Trophy className="h-5 w-5" />
								<span className="font-medium">Leaderboard</span>
							</Link>
							<Link
								href="/achievements"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black transition-colors hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								<Award className="h-5 w-5" />
								<span className="font-medium">Achievements</span>
							</Link>
							<Link
								href="/settings"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black transition-colors hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								<Settings className="h-5 w-5" />
								<span className="font-medium">Settings</span>
							</Link>
						</nav>

						{/* User Profile Section */}
						{user && (
							<div className="mt-auto border-gray-200 border-t p-4">
								<div className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-100">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
										<span className="font-medium text-gray-700 text-sm">
											{user?.user_metadata?.name?.charAt(0) ||
												user?.email?.charAt(0) ||
												"U"}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-medium text-black text-sm">
											{user?.user_metadata?.name || user?.email}
										</p>
										<p className="truncate text-gray-500 text-xs">
											{user?.email}
										</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={async () => {
											await signOut();
											setIsMenuOpen(false);
										}}
										className="h-8 w-8 p-0 text-gray-500 hover:bg-red-50 hover:text-red-600"
										title="Sign out"
									>
										<LogOut className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Mobile Search Overlay (Right Sidebar) */}
			{isSearchOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="absolute inset-0 bg-black bg-opacity-50"
						onClick={() => setIsSearchOpen(false)}
					/>
					<div className="absolute top-0 right-0 h-full w-80 overflow-y-auto bg-white shadow-xl">
						<div className="border-gray-200 border-b p-4">
							<div className="flex items-center justify-between">
								<h2 className="font-bold text-black text-xl">Search & More</h2>
								<button
									onClick={() => setIsSearchOpen(false)}
									className="rounded-lg p-2 hover:bg-gray-100"
								>
									<X className="h-6 w-6" />
								</button>
							</div>
						</div>
						<div className="space-y-6 p-4">
							{/* Search */}
							<div>
								<h3 className="mb-3 font-semibold text-black">
									Search Experiences
								</h3>
								<SearchInput
									onSearch={onSearch}
									onSearchChange={onSearchChange}
									placeholder="Search experiences..."
								/>
							</div>

							{/* Community Stats */}
							{stats && (
								<div className="rounded-lg bg-gray-50 p-4">
									<h3 className="mb-3 font-semibold text-black">
										Community Stats
									</h3>
									<div className="grid grid-cols-2 gap-3 text-center">
										<div className="rounded-lg bg-white p-3">
											<div className="font-bold text-black text-lg">
												{stats.totalExperiences || 0}
											</div>
											<p className="text-gray-600 text-xs">Total Reports</p>
										</div>
										<div className="rounded-lg bg-white p-3">
											<div className="font-bold text-green-600 text-lg">
												{stats.resolvedExperiences || 0}
											</div>
											<p className="text-gray-600 text-xs">Resolved</p>
										</div>
									</div>
									<div className="mt-3 text-center">
										<div className="font-bold text-black text-lg">
											{stats.activeUsers || 0}
										</div>
										<p className="text-gray-600 text-xs">Active Contributors</p>
									</div>
								</div>
							)}

							{/* User Stats */}
							{userStats && (
								<div className="rounded-lg bg-gray-50 p-4">
									<h3 className="mb-3 font-semibold text-black">Your Impact</h3>
									<div className="text-center">
										<div className="font-bold text-2xl text-black">
											{userStats.impactScore || 0}
										</div>
										<p className="text-gray-600 text-sm">Impact Score</p>
									</div>
									<div className="mt-3 grid grid-cols-3 gap-2 text-center">
										<div>
											<div className="font-semibold text-black text-lg">
												{userStats.totalReports || 0}
											</div>
											<p className="text-gray-600 text-xs">Reports</p>
										</div>
										<div>
											<div className="font-semibold text-green-600 text-lg">
												{userStats.resolvedReports || 0}
											</div>
											<p className="text-gray-600 text-xs">Resolved</p>
										</div>
										<div>
											<div className="font-semibold text-lg text-orange-600">
												{userStats.inProgressReports || 0}
											</div>
											<p className="text-gray-600 text-xs">In Progress</p>
										</div>
									</div>
								</div>
							)}

							{/* Map Legend / Categories - Dynamically loaded from database */}
							<div>
								<h3 className="mb-3 font-semibold text-black">
									Issue Categories
								</h3>
								<div className="space-y-2">
									{categories.map((category) => {
										const styling = getCategoryStyling(category.name);
										const IconComponent = styling.icon;

										return (
											<button
												key={category.id}
												onClick={() => {
													onCategoryFilter(category.name);
													setIsSearchOpen(false);
												}}
												className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100"
											>
												<div
													className="flex h-6 w-6 items-center justify-center rounded-full"
													style={{ backgroundColor: styling.color }}
												>
													<IconComponent className="h-4 w-4 text-white" />
												</div>
												<span className="font-medium text-black text-sm">
													{category.name}
												</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Trending Categories */}
							{trendingCategories && trendingCategories.length > 0 && (
								<div>
									<h3 className="mb-3 font-semibold text-black">
										Trending Categories
									</h3>
									<div className="space-y-2">
										{trendingCategories.slice(0, 5).map((category, index) => (
											<button
												key={category.id}
												onClick={() => {
													onCategoryFilter(category.name);
													setIsSearchOpen(false);
												}}
												className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-2 text-left transition-colors hover:bg-gray-100"
											>
												<div className="flex items-center gap-2">
													<span className="text-gray-500 text-xs">
														#{index + 1}
													</span>
													<span className="text-gray-700 text-sm">
														#{category.name}
													</span>
												</div>
												<span className="text-gray-500 text-xs">
													{category.count || 0} reports
												</span>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
