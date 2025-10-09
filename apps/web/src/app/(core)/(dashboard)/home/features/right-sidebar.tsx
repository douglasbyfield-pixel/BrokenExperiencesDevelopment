"use client";

import { Avatar, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import { useExperiencesContext } from "@web/context/ExperiencesContext";
import { useSearch } from "@web/context/SearchContext";
import { cn } from "@web/lib/utils";
import type {
	Experience,
	Stats,
	TrendingCategory,
	UserStats,
} from "@web/types";
import { BarChart3, Calendar, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface RightSidebarProps {
	className?: string;
	stats?: Stats | null;
	userStats?: UserStats | null;
	trendingCategories?: TrendingCategory[] | null;
	recentExperiences?: Experience[] | null;
}

export default function RightSidebar({
	className,
	stats,
	userStats,
	trendingCategories,
	recentExperiences,
}: RightSidebarProps) {
	const { onCategoryFilter } = useSearch();
	const router = useRouter();

	// Get experiences from context if available, otherwise use prop
	let contextExperiences: Experience[] = [];
	try {
		const context = useExperiencesContext();
		contextExperiences = context.experiences;
	} catch {
		// Context not available, use prop
	}
	const experiencesToUse =
		contextExperiences.length > 0
			? contextExperiences
			: recentExperiences || [];

	// Calculate real weekly statistics
	const weeklyStats = useMemo(() => {
		if (!experiencesToUse.length) {
			console.log("📊 No experiences available for weekly stats");
			return {
				newReports: 0,
				resolved: 0,
				inProgress: 0,
			};
		}

		const now = new Date();

		// Calculate proper start of current week (Monday 00:00:00)
		const startOfWeek = new Date(now);
		const day = startOfWeek.getDay();
		const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
		startOfWeek.setDate(diff);
		startOfWeek.setHours(0, 0, 0, 0);

		// End of week is Sunday 23:59:59
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		console.log("📊 Weekly stats calculation:", {
			totalExperiences: experiencesToUse.length,
			timeRange: {
				from: startOfWeek.toISOString(),
				to: endOfWeek.toISOString(),
				currentTime: now.toISOString(),
			},
		});

		// Filter experiences from this week (Monday 00:00 to current time)
		const thisWeekExperiences = experiencesToUse.filter((exp) => {
			const createdDate = new Date(exp.createdAt);
			const isThisWeek = createdDate >= startOfWeek && createdDate <= now;
			if (isThisWeek) {
				console.log("📊 This week experience:", {
					id: exp.id,
					createdAt: exp.createdAt,
					status: exp.status,
					title: exp.title?.substring(0, 50),
				});
			}
			return isThisWeek;
		});

		// Count by status
		const resolved = thisWeekExperiences.filter(
			(exp) => exp.status === "resolved",
		).length;
		const inProgress = thisWeekExperiences.filter(
			(exp) => exp.status === "in_progress",
		).length;

		const stats = {
			newReports: thisWeekExperiences.length,
			resolved,
			inProgress,
		};

		console.log("📊 Final weekly stats:", stats);

		return stats;
	}, [experiencesToUse]);

	// Handle clicking on live activity items
	const handleActivityClick = (experience: Experience) => {
		// Navigate to map with location parameters
		const params = new URLSearchParams();
		if (experience.latitude && experience.longitude) {
			params.set("lat", experience.latitude.toString());
			params.set("lng", experience.longitude.toString());
			params.set("zoom", "16"); // Close zoom to focus on the marker
			params.set("focus", experience.id.toString()); // Experience ID to highlight
		}
		router.push(`/map?${params.toString()}`);
	};

	const [currentPage, setCurrentPage] = useState(0);
	const categoriesPerPage = 5;
	const sidebarRef = useRef<HTMLElement>(null);
	const [position, setPosition] = useState<"relative" | "sticky">("relative");
	const [top, setTop] = useState<number>(0);
	const [prevScrollTop, setPrevScrollTop] = useState(0);
	const [initialOffset, setInitialOffset] = useState(0);

	// Calculate visible categories
	const visibleCategories = trendingCategories
		? trendingCategories.slice(
				currentPage * categoriesPerPage,
				(currentPage + 1) * categoriesPerPage,
			)
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

	// Initialize sidebar offset
	useEffect(() => {
		if (sidebarRef.current) {
			setInitialOffset(sidebarRef.current.offsetTop);
		}
	}, []);

	// Twitter-like sticky sidebar implementation
	useEffect(() => {
		const handleScroll = () => {
			if (!sidebarRef.current) return;

			const scrollYOffset = window.scrollY;
			const isScrollingUp = scrollYOffset < prevScrollTop;
			const isScrollingDown = scrollYOffset > prevScrollTop;

			const element = sidebarRef.current;
			const elementRect = element.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			const isTopEndBetweenViewport =
				elementRect.top >= 0 && elementRect.top <= viewportHeight;
			const isBottomEndBetweenViewport =
				elementRect.bottom >= 0 && elementRect.bottom <= viewportHeight;
			const isTopEndBelowViewport = elementRect.top > viewportHeight;
			const isBottomEndAboveViewport = elementRect.bottom < 0;
			const areBothTopAndBottomEndsOnOppositeEndsOfViewport =
				elementRect.top < 0 && elementRect.bottom > viewportHeight;
			const areBothTopAndBottomEndsBetweenViewport =
				isTopEndBetweenViewport && isBottomEndBetweenViewport;

			// Early exit conditions
			if (isTopEndBelowViewport || isBottomEndAboveViewport) {
				setPosition("relative");
				setTop(scrollYOffset);
				setPrevScrollTop(scrollYOffset);
				return;
			}

			if (areBothTopAndBottomEndsOnOppositeEndsOfViewport) {
				setPosition("relative");
				setTop(element.offsetTop - initialOffset);
				setPrevScrollTop(scrollYOffset);
				return;
			}

			if (areBothTopAndBottomEndsBetweenViewport) {
				setPosition("sticky");
				setTop(0);
				setPrevScrollTop(scrollYOffset);
				return;
			}

			// Direction-based logic
			if (isScrollingUp) {
				if (isTopEndBetweenViewport) {
					setPosition("sticky");
					setTop(0);
				} else if (isBottomEndBetweenViewport) {
					setPosition("relative");
					setTop(element.offsetTop - initialOffset);
				}
			} else if (isScrollingDown) {
				if (isTopEndBetweenViewport) {
					setPosition("relative");
					setTop(element.offsetTop - initialOffset);
				} else if (isBottomEndBetweenViewport) {
					setPosition("sticky");
					setTop(elementRect.top);
				}
			}

			setPrevScrollTop(scrollYOffset);
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Initial call

		return () => window.removeEventListener("scroll", handleScroll);
	}, [prevScrollTop, initialOffset]);

	return (
		<aside
			ref={sidebarRef}
			className={cn("hidden w-72 flex-col bg-white lg:flex lg:w-80", className)}
			style={{
				position,
				top: `${top}px`,
				height: "fit-content",
			}}
		>
			<div className="px-3 py-4 lg:px-4">
				<div className="space-y-6">
					{/* User Statistics */}
					{userStats && (
						<Card className="border-gray-200 bg-gray-50 p-6">
							<h3 className="mb-4 font-bold text-black text-lg">Your Impact</h3>
							<div className="space-y-4">
								<div className="text-center">
									<div className="font-bold text-3xl text-black">
										{userStats.impactScore}
									</div>
									<p className="text-gray-600 text-sm">Impact Score</p>
								</div>
								<div className="grid grid-cols-3 gap-3 text-center">
									<div>
										<div className="font-semibold text-black text-xl">
											{userStats.totalReports}
										</div>
										<p className="text-gray-600 text-xs">Reports</p>
									</div>
									<div>
										<div className="font-semibold text-green-600 text-xl">
											{userStats.resolvedReports}
										</div>
										<p className="text-gray-600 text-xs">Resolved</p>
									</div>
									<div>
										<div className="font-semibold text-orange-600 text-xl">
											{userStats.inProgressReports}
										</div>
										<p className="text-gray-600 text-xs">In Progress</p>
									</div>
								</div>
								<div className="border-gray-200 border-t pt-3">
									<div className="mb-1 text-gray-600 text-sm">
										Contribution Level
									</div>
									<div className="flex items-center space-x-2">
										<div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
											<div
												className="h-full rounded-full bg-black transition-all"
												style={{
													width: `${Math.min((userStats.impactScore / 500) * 100, 100)}%`,
												}}
											/>
										</div>
										<span className="text-gray-600 text-xs">
											{userStats.impactScore < 100
												? "Newcomer"
												: userStats.impactScore < 250
													? "Contributor"
													: userStats.impactScore < 500
														? "Advocate"
														: "Champion"}
										</span>
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* Live Activity */}
					{
						<Card className="border-gray-200 bg-gray-50 p-6 shadow-none">
							<h3 className="mb-4 flex items-center gap-2 font-bold text-black text-lg">
								<TrendingUp className="h-4 w-4 text-gray-600" />
								Live Activity
							</h3>
							<div className="space-y-3">
								{experiencesToUse && experiencesToUse.length > 0 ? (
									experiencesToUse.slice(0, 3).map((experience, index) => {
										const timeAgo =
											new Date().getTime() -
											new Date(experience.createdAt).getTime();
										const minutesAgo = Math.floor(timeAgo / (1000 * 60));
										const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
										const daysAgo = Math.floor(timeAgo / (1000 * 60 * 60 * 24));

										let timeText = "Just now";
										if (minutesAgo > 0 && minutesAgo < 60) {
											timeText = `${minutesAgo}m ago`;
										} else if (hoursAgo > 0 && hoursAgo < 24) {
											timeText = `${hoursAgo}h ago`;
										} else if (daysAgo > 0) {
											timeText = `${daysAgo}d ago`;
										}

										const statusColor =
											experience.status === "resolved"
												? "bg-gray-400"
												: experience.status === "in_progress"
													? "bg-gray-500"
													: "bg-gray-400";
										const actionText =
											experience.status === "resolved"
												? "resolved"
												: "reported";

										return (
											<button
												key={experience.id}
												onClick={() => handleActivityClick(experience)}
												className="flex w-full cursor-pointer items-center gap-3 rounded bg-white/50 p-2 text-left transition-colors hover:bg-white/80"
											>
												<div
													className={`h-2 w-2 ${statusColor} rounded-full ${index === 0 ? "animate-pulse" : ""}`}
												/>
												<div className="flex-1">
													<p className="text-gray-700 text-sm hover:text-gray-900">
														Issue {actionText}{" "}
														{experience.address
															? `at ${experience.address.split(",")[0]}`
															: "in your area"}
													</p>
													<p className="text-gray-500 text-xs">{timeText}</p>
												</div>
											</button>
										);
									})
								) : (
									<div className="flex items-center gap-3 rounded bg-white/50 p-2">
										<div className="h-2 w-2 rounded-full bg-gray-400" />
										<div className="flex-1">
											<p className="text-gray-700 text-sm">
												No recent activity
											</p>
											<p className="text-gray-500 text-xs">Check back later</p>
										</div>
									</div>
								)}
							</div>
						</Card>
					}

					{/* Trending Categories */}
					{trendingCategories &&
						Array.isArray(trendingCategories) &&
						trendingCategories.length > 0 && (
							<Card className="border-gray-200 bg-gray-50 p-6 shadow-none">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="flex items-center gap-2 font-bold text-black text-lg">
										<BarChart3 className="h-4 w-4 text-gray-600" />
										Top Issues
									</h3>
									{totalPages > 1 && (
										<div className="flex gap-1">
											{Array.from({ length: totalPages }).map((_, idx) => (
												<button
													key={idx}
													onClick={() => setCurrentPage(idx)}
													className={`h-1.5 rounded-full transition-all ${
														idx === currentPage
															? "w-6 bg-gray-600"
															: "w-1.5 bg-gray-300 hover:bg-gray-400"
													}`}
													aria-label={`View page ${idx + 1}`}
												/>
											))}
										</div>
									)}
								</div>
								<div className="min-h-[240px] space-y-3">
									{visibleCategories.map((category, index) => {
										return (
											<div
												key={`${category.id}-${currentPage}`}
												className="animate-in fade-in duration-500"
												style={{
													animationDelay: `${index * 100}ms`,
												}}
											>
												<button
													className="w-full rounded-lg border border-gray-200 p-2 text-left transition-colors hover:bg-white"
													onClick={() => onCategoryFilter(category.name)}
												>
													<div className="flex items-center justify-between">
														<p className="font-medium text-black text-sm">
															#{category.name}
														</p>
														<span className="rounded-full bg-gray-600 px-2 py-1 text-white text-xs">
															{category.count}
														</span>
													</div>
													<p className="mt-1 text-gray-600 text-xs">
														Click to filter by this category
													</p>
												</button>
											</div>
										);
									})}
									{/* Fill remaining space to maintain consistent height */}
									{visibleCategories.length < categoriesPerPage && (
										<div className="space-y-3">
											{Array.from({ 
												length: categoriesPerPage - visibleCategories.length 
											}).map((_, index) => (
												<div key={`spacer-${index}`} className="h-[48px]" />
											))}
										</div>
									)}
								</div>
							</Card>
						)}

					{/* Weekly Summary */}
					<Card className="border-gray-200 bg-gray-50 p-6 shadow-none">
						<h3 className="mb-4 flex items-center gap-2 font-bold text-black text-lg">
							<Calendar className="h-4 w-4 text-gray-600" />
							This Week
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-gray-600 text-sm">New Reports</span>
								<span className="font-semibold text-black">
									{weeklyStats.newReports}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600 text-sm">Resolved</span>
								<span className="font-semibold text-green-600">
									{weeklyStats.resolved}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600 text-sm">In Progress</span>
								<span className="font-semibold text-orange-600">
									{weeklyStats.inProgress}
								</span>
							</div>
						</div>
					</Card>

					{/* Footer */}
					<div className="space-y-2 pt-4 text-gray-500 text-xs">
						<div className="flex flex-wrap gap-2">
							<a href="#" className="hover:underline">
								Terms
							</a>
							<span>·</span>
							<a href="#" className="hover:underline">
								Privacy
							</a>
							<span>·</span>
							<a href="#" className="hover:underline">
								Cookie Policy
							</a>
						</div>
						<p>© 2025 Broken Experiences</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
