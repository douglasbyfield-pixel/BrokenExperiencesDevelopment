"use client";

import { Avatar, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import { cn } from "@web/lib/utils";
import { useAuth } from "@web/components/auth-provider";
import type { Stats, UserStats, TrendingCategory } from "@web/types";
import SearchInput from "./search-input";
import { useSearch } from "@web/context/SearchContext";
import { LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface RightSidebarProps {
	className?: string;
	stats?: Stats | null;
	userStats?: UserStats | null;
	trendingCategories?: TrendingCategory[] | null;
}

export default function RightSidebar({ className, stats, userStats, trendingCategories }: RightSidebarProps) {
	const { onSearch, onSearchChange } = useSearch();
	const { signOut } = useAuth();
	const [currentPage, setCurrentPage] = useState(0);
	const categoriesPerPage = 5;
	
	// Calculate visible categories
	const visibleCategories = trendingCategories 
		? trendingCategories.slice(currentPage * categoriesPerPage, (currentPage + 1) * categoriesPerPage)
		: [];
	
	const totalPages = trendingCategories 
		? Math.ceil(trendingCategories.length / categoriesPerPage)
		: 0;
	
	// Auto-cycle through categories every 5 seconds
	useEffect(() => {
		if (!trendingCategories || trendingCategories.length <= categoriesPerPage) {
			return; // Don't cycle if we have 5 or fewer categories
		}
		
		const interval = setInterval(() => {
			setCurrentPage((prev) => (prev + 1) % totalPages);
		}, 5000); // Cycle every 5 seconds
		
		return () => clearInterval(interval);
	}, [trendingCategories, totalPages, categoriesPerPage]);
	return (
		<aside
			className={cn(
				"hidden w-72 lg:w-80 flex-col bg-white lg:flex sticky top-0 self-start max-h-screen overflow-y-auto",
				className,
			)}
		>
			<div className="px-3 lg:px-4 py-4">
				<div className="space-y-6">
				{/* Search */}
				<SearchInput onSearch={onSearch} onSearchChange={onSearchChange} />

				{/* User Statistics */}
				{userStats && (
					<Card className="border-gray-200 bg-gray-50 p-6">
						<h3 className="font-bold text-lg text-black mb-4">Your Impact</h3>
						<div className="space-y-4">
							<div className="text-center">
								<div className="text-3xl font-bold text-black">{userStats.impactScore}</div>
								<p className="text-sm text-gray-600">Impact Score</p>
							</div>
							<div className="grid grid-cols-3 gap-3 text-center">
								<div>
									<div className="text-xl font-semibold text-black">{userStats.totalReports}</div>
									<p className="text-xs text-gray-600">Reports</p>
								</div>
								<div>
									<div className="text-xl font-semibold text-green-600">{userStats.resolvedReports}</div>
									<p className="text-xs text-gray-600">Resolved</p>
								</div>
								<div>
									<div className="text-xl font-semibold text-orange-600">{userStats.inProgressReports}</div>
									<p className="text-xs text-gray-600">In Progress</p>
								</div>
							</div>
							<div className="pt-3 border-t border-gray-200">
								<div className="text-sm text-gray-600 mb-1">Contribution Level</div>
								<div className="flex items-center space-x-2">
									<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
										<div 
											className="h-full bg-black rounded-full transition-all"
											style={{ width: `${Math.min((userStats.impactScore / 500) * 100, 100)}%` }}
										/>
									</div>
									<span className="text-xs text-gray-600">
										{userStats.impactScore < 100 ? "Newcomer" : 
										 userStats.impactScore < 250 ? "Contributor" :
										 userStats.impactScore < 500 ? "Advocate" : "Champion"}
									</span>
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* Platform Statistics - Only show if no user stats */}
				{!userStats && stats && (
					<Card className="border-gray-200 bg-gray-50 p-6">
						<h3 className="font-bold text-lg text-black mb-4">Community Stats</h3>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<div>
									<p className="text-gray-600 text-sm">Total Reports</p>
									<p className="font-semibold text-2xl text-black">{stats.totalExperiences || 0}</p>
								</div>
								<div className="text-right">
									<p className="text-gray-600 text-sm">Resolved</p>
									<p className="font-semibold text-2xl text-green-600">{stats.resolvedExperiences || 0}</p>
								</div>
							</div>
							<div className="pt-4 border-t border-gray-200">
								<p className="text-gray-600 text-sm">Active Contributors</p>
								<p className="font-semibold text-xl text-black mt-1">{stats.activeUsers || 0}</p>
							</div>
						</div>
					</Card>
				)}

			{/* Trending Categories */}
			{trendingCategories && Array.isArray(trendingCategories) && trendingCategories.length > 0 && (
				<Card className="border-gray-200 bg-gray-50 p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-bold text-lg text-black">Trending Categories</h3>
						{totalPages > 1 && (
							<div className="flex gap-1">
								{Array.from({ length: totalPages }).map((_, idx) => (
									<button
										key={idx}
										onClick={() => setCurrentPage(idx)}
										className={`h-1.5 rounded-full transition-all ${
											idx === currentPage 
												? 'w-6 bg-black' 
												: 'w-1.5 bg-gray-300 hover:bg-gray-400'
										}`}
										aria-label={`View page ${idx + 1}`}
									/>
								))}
							</div>
						)}
					</div>
					<div className="space-y-3">
						{visibleCategories.map((category, index) => {
							const globalIndex = currentPage * categoriesPerPage + index;
							return (
								<div key={category.id} className="text-sm">
									<div className="flex items-center justify-between">
										<p className="font-medium text-black">#{category.name}</p>
										<span className="text-xs text-gray-500">#{globalIndex + 1}</span>
									</div>
									<p className="text-gray-600">{category.count} {category.count === 1 ? 'report' : 'reports'}</p>
								</div>
							);
						})}
					</div>
				</Card>
			)}

				{/* Sign Out Button */}
				<Card className="border-gray-200 bg-gray-50 p-4">
					<Button
						variant="outline"
						onClick={signOut}
						className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
					>
						<LogOut className="h-4 w-4" />
						Sign Out
					</Button>
				</Card>

				{/* Footer */}
				<div className="pt-4 text-xs text-gray-500 space-y-2">
					<div className="flex flex-wrap gap-2">
						<a href="#" className="hover:underline">Terms</a>
						<span>·</span>
						<a href="#" className="hover:underline">Privacy</a>
						<span>·</span>
						<a href="#" className="hover:underline">Cookie Policy</a>
					</div>
					<p>© 2025 Broken Experiences</p>
				</div>
				</div>
			</div>
		</aside>
	);
}