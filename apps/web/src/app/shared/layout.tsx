"use client";

import { Button } from "@web/components/ui/button";
import { SearchProvider } from "@web/context/SearchContext";
import { eden } from "@web/lib/eden";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LeftSidebar from "../(core)/(dashboard)/home/features/left-sidebar";
import MobileNav from "../(core)/(dashboard)/home/features/mobile-nav";
import RightSidebar from "../(core)/(dashboard)/home/features/right-sidebar";

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
					eden.stats.trending.get(),
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
			<div className="mx-0 min-h-screen bg-white md:mx-24">
				<MobileNav
					stats={stats}
					userStats={null}
					trendingCategories={trendingCategories}
				/>
				<div className="mx-auto flex max-w-screen-2xl">
					<LeftSidebar />
					<main className="min-w-0 flex-1 lg:border-gray-200 lg:border-x">
						{/* Back Navigation */}
						<div className="border-gray-200 border-b bg-white p-4">
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
