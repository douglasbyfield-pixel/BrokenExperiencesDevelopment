"use client";

import { AchievementsGrid } from "@web/features/achievements";
import { useBadges } from "@web/features/achievements/use-badges";
import { useAuth } from "@web/components/auth-provider";

export function AchievementsClient() {
  const { user } = useAuth();
  
  // Debug user object
  console.log("🔍 User object:", user);
  console.log("🔍 User ID:", user?.id);
  
  const { data: badges = [], isLoading, error } = useBadges(user?.id);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your achievements.</p>
      </div>
    );
  }

  if (!user.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading user information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load achievements</p>
          <p className="text-gray-500 text-sm">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return <AchievementsGrid badges={badges} loading={isLoading} />;
}
