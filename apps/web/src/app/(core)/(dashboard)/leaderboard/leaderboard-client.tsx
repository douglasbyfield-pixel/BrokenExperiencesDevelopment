"use client";

import { CategorySelector } from "@web/features/leaderboard/category-selector";
import { categories, LeaderboardCard } from "@web/features/leaderboard/leaderboard-card";
import { UserProgressBanner } from "@web/features/leaderboard/user-progress-banner";
import { useState, useEffect } from "react";
import { useLeaderboard, useUserRankStats } from "@web/hooks/use-leaderboard";
import { createClient } from "@web/lib/supabase/client";

// Mock data fallback
const generateMockUsers = (count: number) => {
  const names = ["Sarah Johnson", "Mike Chen", "Emma Davis", "Alex Rodriguez", "Lisa Wang"];
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: names[i % names.length],
    avatar: "",
    totalPoints: 1500 - (i * 100),
    level: Math.max(1, Math.floor((1500 - (i * 100)) / 100)),
    experiencesAdded: Math.floor(Math.random() * 50) + 10,
    experiencesFixed: Math.floor(Math.random() * 20) + 5,
    experiencesVerified: Math.floor(Math.random() * 15) + 3,
    experiencesSponsored: Math.floor(Math.random() * 10) + 1,
  }));
};



type CategoryId = typeof categories[number]["id"];

export function LeaderboardClient() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("overall");
  const [userName, setUserName] = useState<string>("");
  
  const { leaderboardData, loading, error } = useLeaderboard(selectedCategory, 10, 0);
  const { rankStats, loading: rankLoading } = useUserRankStats();
  
  useEffect(() => {
    const fetchUserName = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.name) {
        setUserName(session.user.user_metadata.name);
      } else if (session?.user?.email) {
        setUserName(session.user.email.split('@')[0]);
      }
    };
    fetchUserName();
  }, []);

  // Fallback to mock data if API is not available
  const displayData = leaderboardData.length > 0 ? leaderboardData : generateMockUsers(10);
  
  if (loading && leaderboardData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error && leaderboardData.length === 0) {
    console.warn('Leaderboard API not available, using mock data');
  }

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* User Progress Banner - only show for overall category */}
      {selectedCategory === "overall" && (rankStats || !rankLoading) && (
        <UserProgressBanner
          userRank={rankStats?.rank || 1}
          totalUsers={rankStats?.totalUsers || 100}
          currentPoints={rankStats?.currentPoints || 0}
          nextLevelPoints={rankStats?.nextLevelPoints || 100}
          currentLevel={rankStats?.currentLevel || 1}
          userName={userName || "User"}
        />
      )}

      {/* Leaderboard */}
      <LeaderboardCard
        users={displayData}
        category={selectedCategory}
      />
    </div>
  );
}
