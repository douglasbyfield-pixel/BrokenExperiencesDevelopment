"use client";

import LeftSidebar from "./home/features/left-sidebar";
import RightSidebar from "./home/features/right-sidebar";
import MobileNav from "./home/features/mobile-nav";
import { eden } from "@web/lib/eden";
import { useEffect, useState } from "react";
import { SearchProvider } from "@web/context/SearchContext";

export default function HomeLayout({
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
				console.error("Error fetching home layout data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<SearchProvider onSearch={handleSearch}>
			<div className="min-h-screen bg-white md:mx-24 mx-0">
				<MobileNav 
					stats={stats}
					userStats={null}
					trendingCategories={trendingCategories}
				/>
				<div className="mx-auto max-w-screen-xl min-h-screen">
					<div className="flex min-h-screen">
						<LeftSidebar />
						<main className="flex-1 min-w-0 lg:border-x lg:border-gray-200">
							{children}
						</main>
						<RightSidebar
							stats={stats}
							userStats={null}
							trendingCategories={trendingCategories}
							recentExperiences={[]}
						/>
					</div>
				</div>
			</div>
		</SearchProvider>
	);
}