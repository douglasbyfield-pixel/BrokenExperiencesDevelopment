"use client";

import { useAuth } from "@web/components/auth-provider";
import { AchievementsGrid } from "@web/features/achievements";
import { useBadges } from "@web/features/achievements/use-badges";

export function AchievementsClient() {
	const { user } = useAuth();

	// Debug user object
	console.log("🔍 User object:", user);
	console.log("🔍 User ID:", user?.id);

	const { data: badges = [], isLoading, error } = useBadges(user?.id);

	if (!user) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-gray-500">
					Please log in to view your achievements.
				</p>
			</div>
		);
	}

	if (!user.id) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-gray-500">Loading user information...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-center">
					<p className="mb-2 text-red-500">Failed to load achievements</p>
					<p className="text-gray-500 text-sm">
						{error instanceof Error ? error.message : "An error occurred"}
					</p>
				</div>
			</div>
		);
	}

	return <AchievementsGrid badges={badges} loading={isLoading} />;
}
