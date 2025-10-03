"use client";

import { ActivityBreakdown } from "@web/features/leaderboard/activity-breakdown";
import { CategorySelector } from "@web/features/leaderboard/category-selector";
import { categories, LeaderboardCard } from "@web/features/leaderboard/leaderboard-card";
import { useState } from "react";


// Mock data for now - this will be replaced with API calls
const mockLeaderboardData = {
  overall: [
    { id: "1", name: "Sarah Johnson", avatar: "", totalPoints: 1250, level: 12, experiencesAdded: 45, experiencesFixed: 12, experiencesVerified: 8, experiencesSponsored: 3 },
    { id: "2", name: "Mike Chen", avatar: "", totalPoints: 1180, level: 11, experiencesAdded: 38, experiencesFixed: 15, experiencesVerified: 6, experiencesSponsored: 2 },
    { id: "3", name: "Emma Davis", avatar: "", totalPoints: 1100, level: 11, experiencesAdded: 42, experiencesFixed: 10, experiencesVerified: 9, experiencesSponsored: 1 },
    { id: "4", name: "Alex Rodriguez", avatar: "", totalPoints: 980, level: 10, experiencesAdded: 35, experiencesFixed: 8, experiencesVerified: 12, experiencesSponsored: 4 },
    { id: "5", name: "Lisa Wang", avatar: "", totalPoints: 920, level: 9, experiencesAdded: 28, experiencesFixed: 14, experiencesVerified: 5, experiencesSponsored: 3 },
  ],
  experiencesAdded: [
    { id: "1", name: "Sarah Johnson", avatar: "", count: 45, totalPoints: 450 },
    { id: "2", name: "Emma Davis", avatar: "", count: 42, totalPoints: 420 },
    { id: "3", name: "Mike Chen", avatar: "", count: 38, totalPoints: 380 },
    { id: "4", name: "Alex Rodriguez", avatar: "", count: 35, totalPoints: 350 },
    { id: "5", name: "Lisa Wang", avatar: "", count: 28, totalPoints: 280 },
  ],
  experiencesFixed: [
    { id: "2", name: "Mike Chen", avatar: "", count: 15, totalPoints: 300 },
    { id: "5", name: "Lisa Wang", avatar: "", count: 14, totalPoints: 280 },
    { id: "1", name: "Sarah Johnson", avatar: "", count: 12, totalPoints: 240 },
    { id: "4", name: "Alex Rodriguez", avatar: "", count: 8, totalPoints: 160 },
    { id: "3", name: "Emma Davis", avatar: "", count: 10, totalPoints: 200 },
  ],
  experiencesVerified: [
    { id: "4", name: "Alex Rodriguez", avatar: "", count: 12, totalPoints: 180 },
    { id: "1", name: "Sarah Johnson", avatar: "", count: 8, totalPoints: 120 },
    { id: "3", name: "Emma Davis", avatar: "", count: 9, totalPoints: 135 },
    { id: "2", name: "Mike Chen", avatar: "", count: 6, totalPoints: 90 },
    { id: "5", name: "Lisa Wang", avatar: "", count: 5, totalPoints: 75 },
  ],
  experiencesSponsored: [
    { id: "4", name: "Alex Rodriguez", avatar: "", count: 4, totalPoints: 120 },
    { id: "1", name: "Sarah Johnson", avatar: "", count: 3, totalPoints: 90 },
    { id: "5", name: "Lisa Wang", avatar: "", count: 3, totalPoints: 90 },
    { id: "2", name: "Mike Chen", avatar: "", count: 2, totalPoints: 60 },
    { id: "3", name: "Emma Davis", avatar: "", count: 1, totalPoints: 30 },
  ],
};

type CategoryId = typeof categories[number]["id"];

export function LeaderboardClient() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("overall");

  const currentData = mockLeaderboardData[selectedCategory];

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Leaderboard */}
      <LeaderboardCard
        users={currentData}
        category={selectedCategory}
      />

      {/* Activity Breakdown for Overall Category */}
      {selectedCategory === "overall" && (
        <ActivityBreakdown users={currentData} />
      )}
    </div>
  );
}
