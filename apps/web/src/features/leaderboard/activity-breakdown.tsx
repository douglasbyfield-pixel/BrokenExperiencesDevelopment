"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@web/components/ui/card";
import { DollarSign, Heart, Star, Target } from "lucide-react";
import type { LeaderboardUser } from "./leaderboard-card";

interface ActivityBreakdownProps {
	users: LeaderboardUser[];
}

export function ActivityBreakdown({ users }: ActivityBreakdownProps) {
	const totals = users.reduce(
		(acc, user) => ({
			experiencesAdded: acc.experiencesAdded + (user.experiencesAdded || 0),
			experiencesFixed: acc.experiencesFixed + (user.experiencesFixed || 0),
			experiencesVerified:
				acc.experiencesVerified + (user.experiencesVerified || 0),
			experiencesSponsored:
				acc.experiencesSponsored + (user.experiencesSponsored || 0),
		}),
		{
			experiencesAdded: 0,
			experiencesFixed: 0,
			experiencesVerified: 0,
			experiencesSponsored: 0,
		},
	);

	const activities = [
		{
			id: "experiencesAdded",
			name: "Reports",
			icon: Target,
			count: totals.experiencesAdded,
			color: "text-blue-600",
			bgColor: "bg-blue-50 dark:bg-blue-950",
		},
		{
			id: "experiencesFixed",
			name: "Fixes",
			icon: Star,
			count: totals.experiencesFixed,
			color: "text-green-600",
			bgColor: "bg-green-50 dark:bg-green-950",
		},
		{
			id: "experiencesVerified",
			name: "Verifications",
			icon: Heart,
			count: totals.experiencesVerified,
			color: "text-purple-600",
			bgColor: "bg-purple-50 dark:bg-purple-950",
		},
		{
			id: "experiencesSponsored",
			name: "Sponsorships",
			icon: DollarSign,
			count: totals.experiencesSponsored,
			color: "text-orange-600",
			bgColor: "bg-orange-50 dark:bg-orange-950",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Activity Breakdown</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{activities.map((activity) => {
						const Icon = activity.icon;
						return (
							<div
								key={activity.id}
								className={`rounded-lg p-4 text-center ${activity.bgColor}`}
							>
								<Icon className={`mx-auto mb-2 h-6 w-6 ${activity.color}`} />
								<div className={`font-bold text-2xl ${activity.color}`}>
									{activity.count}
								</div>
								<div className="text-muted-foreground text-sm">
									{activity.name}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
