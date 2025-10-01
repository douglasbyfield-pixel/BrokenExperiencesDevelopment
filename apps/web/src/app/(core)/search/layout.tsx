"use client";

import LeftSidebar from "../home/features/left-sidebar";
import RightSidebar from "../home/features/right-sidebar";
import MobileNav from "../home/features/mobile-nav";
import { eden } from "@web/lib/eden";
import { useEffect, useState } from "react";
import { SearchProvider } from "@web/context/SearchContext";

export default function SearchLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [stats, setStats] = useState<any>(null);
	const [trendingCategories, setTrendingCategories] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	// Dummy search function for layout - will be overridden by page-level search
	const handleSearch = (searchTerm: string) => {
		console.log("Search from layout:", searchTerm);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsResult, trendingResult] = await Promise.all([
					eden.stats.get(),
					eden.stats.trending.get()
				]);
				setStats(statsResult?.data);
				setTrendingCategories(trendingResult?.data);
			} catch (error) {
				console.error("Error fetching search layout data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<SearchProvider onSearch={handleSearch}>
			<div className="min-h-screen bg-white">
				<MobileNav 
					stats={stats}
					userStats={null}
					trendingCategories={trendingCategories}
				/>
				<div className="mx-auto flex max-w-screen-2xl">
					<div className="w-80 lg:w-96 flex-shrink-0">
						<LeftSidebar />
					</div>
					<main className="flex-1 min-w-0 lg:border-x lg:border-gray-200">
						{children}
					</main>
					<div className="w-80 lg:w-96 flex-shrink-0">
						<RightSidebar
							stats={stats}
							userStats={null}
							trendingCategories={trendingCategories}
						/>
					</div>
				</div>
			</div>
		</SearchProvider>
	);
}
