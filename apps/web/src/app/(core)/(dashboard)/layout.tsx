"use client";

import { BottomNavigation } from "@web/components/bottom-navigation";
import { OfflineBanner } from "@web/components/offline-banner";
import { CameraProvider } from "@web/context/CameraContext";
import { SearchProvider } from "@web/context/SearchContext";
import { useExperiences } from "@web/hooks/use-experiences";
import { eden } from "@web/lib/eden";
import { useEffect, useState } from "react";
import LeftSidebar from "./home/features/left-sidebar";
import MobileNav from "./home/features/mobile-nav";
import RightSidebar from "./home/features/right-sidebar";

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [stats, setStats] = useState<any>(null);
	const [trendingCategories, setTrendingCategories] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	// Get recent experiences for live activity
	const { data: experiences = [] } = useExperiences();

	// Dummy search function for layout - will be overridden by page-level search
	const handleSearch = (searchTerm: string) => {
		console.log("Search from layout:", searchTerm);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsResult, trendingResult] = await Promise.all([
					eden.stats.get(),
					eden.stats.trending.get(),
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
		<CameraProvider>
			<SearchProvider onSearch={handleSearch}>
				<OfflineBanner />
				<div className="mx-0 min-h-screen bg-white md:mx-24">
					{/* Keep original mobile nav for larger screens/special features */}
					<MobileNav
						stats={stats}
						userStats={null}
						trendingCategories={trendingCategories}
					/>
					<div className="mx-auto min-h-screen max-w-screen-xl">
						<div className="flex min-h-screen">
							<LeftSidebar />
							<main className="min-w-0 flex-1 pb-16 lg:border-gray-200 lg:border-x lg:pb-0">
								{children}
							</main>
							<RightSidebar
								stats={stats}
								userStats={null}
								trendingCategories={trendingCategories}
								recentExperiences={experiences}
							/>
						</div>
					</div>
					{/* New Instagram-style bottom navigation */}
					<BottomNavigation />
				</div>
			</SearchProvider>
		</CameraProvider>
	);
}
