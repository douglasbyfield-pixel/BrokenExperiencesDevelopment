import { LeaderboardClient } from "./leaderboard-client";

export default function LeaderboardPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl text-gray-900 dark:text-white">
					Leaderboard
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					See who's making the biggest impact in fixing broken experiences
				</p>
			</div>

			<LeaderboardClient />
		</div>
	);
}
