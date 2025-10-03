import { LeaderboardClient } from "./leaderboard-client";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          See who's making the biggest impact in fixing broken experiences
        </p>
      </div>
      
      <LeaderboardClient />
    </div>
  );
}
