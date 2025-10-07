import { AchievementsClient } from "./achievements-client";

export default function AchievementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Unlock badges by completing activities and making an impact
        </p>
      </div>
      
      <AchievementsClient />
    </div>
  );
}
