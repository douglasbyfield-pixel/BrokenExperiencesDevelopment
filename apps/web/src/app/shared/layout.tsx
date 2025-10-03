"use client";

import LeftSidebar from "../(core)/(dashboard)/home/features/left-sidebar";
import RightSidebar from "../(core)/(dashboard)/home/features/right-sidebar";
import MobileNav from "../(core)/(dashboard)/home/features/mobile-nav";
import { eden } from "@web/lib/eden";
import { useEffect, useState } from "react";
import { SearchProvider } from "@web/context/SearchContext";
import { Button } from "@web/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SharedLayout({
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
				console.error("Error fetching shared layout data:", error);
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
				<div className="mx-auto flex max-w-screen-2xl">
					<LeftSidebar />
					<main className="flex-1 min-w-0 lg:border-x lg:border-gray-200">
						{/* Back Navigation */}
						<div className="p-4 border-b border-gray-200 bg-white">
							<Link href="/">
								<Button variant="ghost" size="sm" className="gap-2">
									<ArrowLeft className="h-4 w-4" />
									Back to Home
								</Button>
							</Link>
						</div>
						{children}
					</main>
					<div className="flex-shrink-0">
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
