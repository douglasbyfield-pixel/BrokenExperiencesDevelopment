"use client";

import { Button } from "@web/components/ui/button";
import { useAuth } from "@web/components/auth-provider";
import { useSearch } from "@web/context/SearchContext";
import SearchInput from "./search-input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOut, Search, Menu, X, Home, Map, User, Settings, Download } from "lucide-react";
import type { Stats, UserStats, TrendingCategory } from "@web/types";
import { getCategoryStyling } from "@web/lib/category-config";
import { eden } from "@web/lib/eden";
import { triggerPWAInstall, canInstallPWA } from "@web/components/add-to-home-screen";

interface MobileNavProps {
	stats?: Stats | null;
	userStats?: UserStats | null;
	trendingCategories?: TrendingCategory[] | null;
}

export default function MobileNav({ stats, userStats, trendingCategories }: MobileNavProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
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
				const result = await eden.category.get({ $query: { limit: 50, offset: 0 } });
				if (Array.isArray(result?.data)) {
					// Sort categories alphabetically
					const sorted = result.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
					setCategories(sorted);
				}
			} catch (error) {
				console.error('Failed to fetch categories:', error);
			}
		};
		
		fetchCategories();
	}, []);

	return (
		<>
			{/* Mobile Header */}
			<div className="sticky top-0 z-50 lg:hidden bg-white border-b border-gray-200">
				<div className="flex items-center justify-between p-4">
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="p-2 rounded-lg hover:bg-gray-100"
					>
						<Menu className="w-6 h-6" />
					</button>
					<button 
						onClick={canInstall ? triggerPWAInstall : undefined}
						className={`flex items-center space-x-2 ${canInstall ? 'cursor-pointer group' : 'cursor-default'}`}
						title={canInstall ? "Install App" : ""}
					>
						<div className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white p-1 relative ${canInstall ? 'group-hover:scale-110 transition-transform' : ''}`}>
							<img
								src="/images/logo.png"
								alt="Broken Experiences"
								className="h-full w-full object-contain"
							/>
							{canInstall && (
								<div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-black text-white flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
									<Download className="w-2 h-2" />
								</div>
							)}
						</div>
						<h1 className="font-bold text-lg text-black">
							Broken<span className="text-gray-600">Experiences</span>
						</h1>
					</button>
					<button
						onClick={() => setIsSearchOpen(!isSearchOpen)}
						className="p-2 rounded-lg hover:bg-gray-100"
					>
						<Search className="w-6 h-6" />
					</button>
				</div>
			</div>

			{/* Mobile Menu Overlay (Left Sidebar) */}
			{isMenuOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
					<div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
						<div className="p-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="font-bold text-xl text-black">Navigation</h2>
								<button
									onClick={() => setIsMenuOpen(false)}
									className="p-2 rounded-lg hover:bg-gray-100"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
						</div>
						<nav className="p-4 space-y-2">
							<Link
								href="/home"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
								</svg>
								<span className="font-medium">Home</span>
							</Link>
							<Link
								href="/map"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
								</svg>
								<span className="font-medium">Map</span>
							</Link>
							<Link
								href="/profile"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								<span className="font-medium">Profile</span>
							</Link>
							<Link
								href="/settings"
								className="flex items-center gap-3 rounded-lg px-3 py-3 text-black hover:bg-gray-100 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								<span className="font-medium">Settings</span>
							</Link>
						</nav>
						
						{/* User Profile Section */}
						{user && (
							<div className="mt-auto p-4 border-t border-gray-200">
								<div className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-100">
									<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
										<span className="text-sm font-medium text-gray-700">
											{user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm text-black">{user?.user_metadata?.name || user?.email}</p>
										<p className="text-gray-500 text-xs truncate">{user?.email}</p>
									</div>
							<Button
								variant="ghost"
										size="sm"
								onClick={async () => {
									await signOut();
									setIsMenuOpen(false);
								}}
										className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
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
					<div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSearchOpen(false)} />
					<div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
						<div className="p-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="font-bold text-xl text-black">Search & More</h2>
								<button
									onClick={() => setIsSearchOpen(false)}
									className="p-2 rounded-lg hover:bg-gray-100"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
						</div>
						<div className="p-4 space-y-6">
							{/* Search */}
							<div>
								<h3 className="font-semibold text-black mb-3">Search Experiences</h3>
								<SearchInput onSearch={onSearch} onSearchChange={onSearchChange} placeholder="Search experiences..." />
							</div>

							{/* Community Stats */}
							{stats && (
								<div className="bg-gray-50 rounded-lg p-4">
									<h3 className="font-semibold text-black mb-3">Community Stats</h3>
									<div className="grid grid-cols-2 gap-3 text-center">
										<div className="bg-white rounded-lg p-3">
											<div className="text-lg font-bold text-black">{stats.totalExperiences || 0}</div>
											<p className="text-xs text-gray-600">Total Reports</p>
										</div>
										<div className="bg-white rounded-lg p-3">
											<div className="text-lg font-bold text-green-600">{stats.resolvedExperiences || 0}</div>
											<p className="text-xs text-gray-600">Resolved</p>
										</div>
									</div>
									<div className="mt-3 text-center">
										<div className="text-lg font-bold text-black">{stats.activeUsers || 0}</div>
										<p className="text-xs text-gray-600">Active Contributors</p>
									</div>
								</div>
							)}

							{/* User Stats */}
							{userStats && (
								<div className="bg-gray-50 rounded-lg p-4">
									<h3 className="font-semibold text-black mb-3">Your Impact</h3>
									<div className="text-center">
										<div className="text-2xl font-bold text-black">{userStats.impactScore || 0}</div>
										<p className="text-sm text-gray-600">Impact Score</p>
									</div>
									<div className="grid grid-cols-3 gap-2 mt-3 text-center">
										<div>
											<div className="text-lg font-semibold text-black">{userStats.totalReports || 0}</div>
											<p className="text-xs text-gray-600">Reports</p>
										</div>
										<div>
											<div className="text-lg font-semibold text-green-600">{userStats.resolvedReports || 0}</div>
											<p className="text-xs text-gray-600">Resolved</p>
										</div>
										<div>
											<div className="text-lg font-semibold text-orange-600">{userStats.inProgressReports || 0}</div>
											<p className="text-xs text-gray-600">In Progress</p>
										</div>
									</div>
								</div>
							)}

							{/* Map Legend / Categories - Dynamically loaded from database */}
							<div>
								<h3 className="font-semibold text-black mb-3">Issue Categories</h3>
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
												className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
											>
												<div className={`w-6 h-6 rounded-full ${styling.bgColor} flex items-center justify-center`}>
													<IconComponent className="w-4 h-4 text-white" />
												</div>
												<span className="text-sm text-gray-700">{category.name}</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Trending Categories */}
							{trendingCategories && trendingCategories.length > 0 && (
								<div>
									<h3 className="font-semibold text-black mb-3">Trending Categories</h3>
									<div className="space-y-2">
										{trendingCategories.slice(0, 5).map((category, index) => (
											<button
												key={category.id}
												onClick={() => {
													onCategoryFilter(category.name);
													setIsSearchOpen(false);
												}}
												className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
											>
												<div className="flex items-center gap-2">
													<span className="text-xs text-gray-500">#{index + 1}</span>
													<span className="text-sm text-gray-700">#{category.name}</span>
												</div>
												<span className="text-xs text-gray-500">{category.count || 0} reports</span>
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