"use client";

import { CategorySelector } from "@web/features/leaderboard/category-selector";
import { categories, LeaderboardCard } from "@web/features/leaderboard/leaderboard-card";
import { UserProgressBanner } from "@web/features/leaderboard/user-progress-banner";
import { useState } from "react";


// Mock data for now - this will be replaced with API calls
const generateMockUsers = (count: number, basePoints: number = 1000) => {
  const names = ["Sarah Johnson", "Mike Chen", "Emma Davis", "Alex Rodriguez", "Lisa Wang", "John Smith", "Maria Garcia", "David Lee", "Anna Wilson", "Chris Brown", "Jessica Taylor", "Michael Johnson", "Sarah Williams", "Robert Jones", "Jennifer Davis", "William Miller", "Linda Garcia", "James Wilson", "Patricia Anderson", "Charles Thomas"];
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ""),
    avatar: "",
    totalPoints: basePoints - (i * 10),
    level: Math.max(1, Math.floor((basePoints - (i * 10)) / 100)),
    experiencesAdded: Math.floor(Math.random() * 50) + 10,
    experiencesFixed: Math.floor(Math.random() * 20) + 5,
    experiencesVerified: Math.floor(Math.random() * 15) + 3,
    experiencesSponsored: Math.floor(Math.random() * 10) + 1,
  }));
};

const mockLeaderboardData = {
  overall: generateMockUsers(100, 1500),
  experiencesAdded: generateMockUsers(100, 1000).map(user => ({ ...user, count: user.experiencesAdded, totalPoints: user.experiencesAdded * 10 })),
  experiencesFixed: generateMockUsers(100, 1000).map(user => ({ ...user, count: user.experiencesFixed, totalPoints: user.experiencesFixed * 20 })),
  experiencesVerified: generateMockUsers(100, 1000).map(user => ({ ...user, count: user.experiencesVerified, totalPoints: user.experiencesVerified * 15 })),
  experiencesSponsored: generateMockUsers(100, 1000).map(user => ({ ...user, count: user.experiencesSponsored, totalPoints: user.experiencesSponsored * 30 })),
};

type CategoryId = typeof categories[number]["id"];

export function LeaderboardClient() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("overall");

  const currentData = mockLeaderboardData[selectedCategory];
  const displayedUsers = currentData.slice(0, 10); // Show only first 10 users

  // Mock user data - this will be replaced with actual user data from auth
  const mockUserData = {
    rank: 3,
    totalUsers: 100,
    currentPoints: 1100,
    nextLevelPoints: 1200,
    currentLevel: 11,
    userName: "Emma Davis"
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* User Progress Banner - only show for overall category */}
      {selectedCategory === "overall" && (
        <UserProgressBanner
          userRank={mockUserData.rank}
          totalUsers={mockUserData.totalUsers}
          currentPoints={mockUserData.currentPoints}
          nextLevelPoints={mockUserData.nextLevelPoints}
          currentLevel={mockUserData.currentLevel}
          userName={mockUserData.userName}
        />
      )}

      {/* Leaderboard */}
      <LeaderboardCard
        users={displayedUsers}
        category={selectedCategory}
      />
    </div>
  );
}
