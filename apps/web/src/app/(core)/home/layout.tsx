"use client";

import LeftSidebar from "./features/left-sidebar";
import RightSidebar from "./features/right-sidebar";
import { eden } from "@web/lib/eden";
import { useEffect, useState } from "react";

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [stats, setStats] = useState<any>(null);
	const [trendingCategories, setTrendingCategories] = useState<any>(null);
	const [loading, setLoading] = useState(true);

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
		<div className="min-h-screen bg-white">
			<div className="mx-auto flex max-w-screen-xl">
				<LeftSidebar />
				<main className="flex-1 min-w-0 lg:border-x lg:border-gray-200">
					{children}
				</main>
				<RightSidebar 
					stats={stats} 
					userStats={null}
					trendingCategories={trendingCategories}
				/>
			</div>
		</div>
	);
}
