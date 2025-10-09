"use client";

import { Bug, DollarSign, MessageSquare, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { BadgeCard, type BadgeData } from "./badge-card";

interface AchievementsGridProps {
	badges: BadgeData[];
	loading?: boolean;
}

const categoryInfo = {
	fixer: {
		name: "Fixer",
		icon: Bug,
		color: "text-black",
		bgGlass: "bg-emerald-500/10",
		borderGlass: "border-emerald-300/20",
		gradient: "from-emerald-500/20 to-green-500/20",
	},
	reporter: {
		name: "Reporter",
		icon: MessageSquare,
		color: "text-black",
		bgGlass: "bg-blue-500/10",
		borderGlass: "border-blue-300/20",
		gradient: "from-blue-500/20 to-indigo-500/20",
	},
	sponsor: {
		name: "Sponsor",
		icon: DollarSign,
		color: "text-black",
		bgGlass: "bg-amber-500/10",
		borderGlass: "border-amber-300/20",
		gradient: "from-amber-500/20 to-orange-500/20",
	},
	community: {
		name: "Community",
		icon: Users,
		color: "text-black",
		bgGlass: "bg-violet-500/10",
		borderGlass: "border-violet-300/20",
		gradient: "from-violet-500/20 to-purple-500/20",
	},
};

export function AchievementsGrid({
	badges,
	loading = false,
}: AchievementsGridProps) {
	const [animatedCount, setAnimatedCount] = useState(0);
	const [showStats, setShowStats] = useState(false);

	const obtainedCount = badges.filter((badge) => badge.isObtained).length;
	const totalCount = badges.length;

	useEffect(() => {
		if (!loading && badges.length > 0) {
			// Animate the count
			const duration = 1500;
			const steps = 30;
			const increment = obtainedCount / steps;
			let current = 0;

			const timer = setInterval(() => {
				current += increment;
				if (current >= obtainedCount) {
					setAnimatedCount(obtainedCount);
					clearInterval(timer);
				} else {
					setAnimatedCount(Math.floor(current));
				}
			}, duration / steps);

			// Show stats after a delay
			setTimeout(() => setShowStats(true), 200);

			return () => clearInterval(timer);
		}
	}, [loading, badges, obtainedCount]);

	if (loading) {
		return (
			<div className="space-y-8">
				{/* Header Skeleton */}
				<div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 animate-pulse rounded-full bg-white/20 backdrop-blur-md" />
								<div className="space-y-2">
									<div className="h-6 w-32 animate-pulse rounded bg-white/20 backdrop-blur-md" />
									<div className="h-4 w-48 animate-pulse rounded bg-white/20 backdrop-blur-md" />
								</div>
							</div>
							<div className="space-y-2 text-right">
								<div className="h-8 w-16 animate-pulse rounded bg-white/20 backdrop-blur-md" />
								<div className="h-4 w-20 animate-pulse rounded bg-white/20 backdrop-blur-md" />
							</div>
						</div>
					</div>
				</div>

				{/* Grid Skeleton */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							key={i}
							className="animate-pulse rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
						>
							<div className="p-4">
								<div className="space-y-3">
									<div className="h-4 w-3/4 rounded bg-white/20 backdrop-blur-md" />
									<div className="mx-auto h-8 w-12 rounded-full bg-white/20 backdrop-blur-md" />
									<div className="h-3 w-full rounded bg-white/20 backdrop-blur-md" />
									<div className="h-3 w-2/3 rounded bg-white/20 backdrop-blur-md" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Group badges by category
	const badgesByCategory = badges.reduce(
		(acc, badge) => {
			if (!acc[badge.category]) {
				acc[badge.category] = [];
			}
			acc[badge.category].push(badge);
			return acc;
		},
		{} as Record<string, BadgeData[]>,
	);

	return (
		<div className="space-y-8">
			{/* Stats Summary Card */}
			<div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/15">
				{/* Enhanced glassmorphism background */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/8 to-white/3" />
				<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

				<div className="relative z-10 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="relative">
								<div className="rounded-2xl border border-white/30 bg-white/20 p-3 backdrop-blur-md">
									<Trophy className="h-8 w-8 stroke-[1.5] text-black" />
								</div>
							</div>
							<div
								className={`transition-all duration-500 ${showStats ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
							>
								<h2 className="mb-1 font-bold text-gray-900 text-xl">
									Your Progress
								</h2>
								<p className="text-gray-600">Track your achievement journey</p>
							</div>
						</div>

						<div
							className={`text-right transition-all delay-200 duration-700 ${showStats ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
						>
							<div className="flex items-baseline gap-2">
								<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-3xl text-transparent">
									{animatedCount}
								</span>
								<span className="font-semibold text-gray-400 text-xl">/</span>
								<span className="font-semibold text-gray-600 text-xl">
									{totalCount}
								</span>
							</div>
							<div className="mt-1 text-gray-600 text-sm">Badges Unlocked</div>

							{/* Progress ring */}
							<div className="relative mx-auto mt-3 h-14 w-14">
								<svg
									className="-rotate-90 h-14 w-14 transform"
									viewBox="0 0 36 36"
								>
									<path
										className="text-gray-200"
										stroke="currentColor"
										strokeWidth="3"
										fill="none"
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
									/>
									<path
										className="text-blue-500"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
										fill="none"
										strokeDasharray={`${(animatedCount / totalCount) * 100}, 100`}
										d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
										style={{ transition: "stroke-dasharray 1.5s ease-in-out" }}
									/>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="font-semibold text-gray-600 text-xs">
										{Math.round((animatedCount / totalCount) * 100)}%
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Categories */}
			{Object.entries(badgesByCategory).map(
				([category, categoryBadges], categoryIndex) => {
					const categoryData =
						categoryInfo[category as keyof typeof categoryInfo];
					const Icon = categoryData?.icon || Trophy;
					const obtainedInCategory = categoryBadges.filter(
						(badge) => badge.isObtained,
					).length;
					const completionPercentage = Math.round(
						(obtainedInCategory / categoryBadges.length) * 100,
					);

					return (
						<div key={category} className="space-y-6">
							{/* Enhanced Category Header */}
							<div className="relative">
								<div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/15">
									<div className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4">
												<div
													className={`relative rounded-2xl p-3 ${categoryData?.bgGlass} ${categoryData?.borderGlass} border backdrop-blur-md`}
												>
													<Icon
														className={`h-6 w-6 ${categoryData?.color} stroke-[1.5]`}
													/>
													{/* Subtle glow effect */}
													<div
														className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${categoryData?.gradient} opacity-30 blur-sm`}
													/>
												</div>
												<div>
													<h3 className="mb-1 font-bold text-gray-900 text-xl">
														{categoryData?.name} Badges
													</h3>
													<p className="text-gray-600 text-sm">
														{obtainedInCategory} of {categoryBadges.length}{" "}
														unlocked
													</p>
												</div>
											</div>

											<div className="text-right">
												<div
													className={`rounded-xl border px-3 py-1 font-medium text-sm backdrop-blur-md ${
														completionPercentage === 100
															? "border-emerald-300/25 bg-emerald-500/15 text-emerald-800"
															: completionPercentage >= 50
																? "border-blue-300/25 bg-blue-500/15 text-blue-800"
																: "border-slate-300/25 bg-slate-500/15 text-slate-800"
													}`}
												>
													{completionPercentage}% Complete
												</div>

												{/* Category progress bar */}
												<div className="mt-2 h-2 w-24 overflow-hidden rounded-full border border-white/20 bg-white/20 backdrop-blur-md">
													<div
														className={`h-full bg-gradient-to-r ${categoryData?.gradient} transition-all duration-1000 ease-out`}
														style={{ width: `${completionPercentage}%` }}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Enhanced Badges Grid */}
							<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
								{categoryBadges.map((badge, badgeIndex) => (
									<BadgeCard
										key={badge.id}
										badge={badge}
										style={{
											animationDelay: `${categoryIndex * 100 + badgeIndex * 50}ms`,
										}}
									/>
								))}
							</div>
						</div>
					);
				},
			)}
		</div>
	);
}
