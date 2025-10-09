"use client";

import { CategorySelector } from "@web/features/leaderboard/category-selector";
import {
	type categories,
	LeaderboardCard,
} from "@web/features/leaderboard/leaderboard-card";
import { UserProgressBanner } from "@web/features/leaderboard/user-progress-banner";
import { useLeaderboard, useUserRankStats } from "@web/hooks/use-leaderboard";
import { createClient } from "@web/lib/supabase/client";
import { useEffect, useState } from "react";

type CategoryId = (typeof categories)[number]["id"];

export function LeaderboardClient() {
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryId>("overall");
	const [userName, setUserName] = useState<string>("");

	const { leaderboardData, loading, error } = useLeaderboard(
		selectedCategory,
		10,
		0,
	);
	const { rankStats, loading: rankLoading } = useUserRankStats();

	useEffect(() => {
		const fetchUserName = async () => {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.user_metadata?.name) {
				setUserName(session.user.user_metadata.name);
			} else if (session?.user?.email) {
				setUserName(session.user.email.split("@")[0]);
			}
		};
		fetchUserName();
	}, []);

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-violet-600 border-b-2" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="py-12 text-center">
				<p className="text-red-500">Failed to load leaderboard: {error}</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Category Selector */}
			<CategorySelector
				selectedCategory={selectedCategory}
				onCategoryChange={setSelectedCategory}
			/>

			{/* User Progress Banner - only show for overall category and when we have rank data */}
			{selectedCategory === "overall" && rankStats && !rankLoading && (
				<UserProgressBanner
					userRank={rankStats.rank}
					totalUsers={rankStats.totalUsers}
					currentPoints={rankStats.currentPoints}
					nextLevelPoints={rankStats.nextLevelPoints}
					currentLevel={rankStats.currentLevel}
					userName={userName || "User"}
				/>
			)}

			{/* Leaderboard */}
			<LeaderboardCard users={leaderboardData} category={selectedCategory} />
		</div>
	);
}
