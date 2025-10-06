"use client";

import { CategorySelector } from "@web/features/leaderboard/category-selector";
import { categories, LeaderboardCard } from "@web/features/leaderboard/leaderboard-card";
import { UserProgressBanner } from "@web/features/leaderboard/user-progress-banner";
import { useState, useEffect } from "react";
import { useLeaderboard, useUserRankStats } from "@web/hooks/use-leaderboard";
import { createClient } from "@web/lib/supabase/client";




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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load leaderboard: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
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
      <LeaderboardCard
        users={leaderboardData}
        category={selectedCategory}
      />
    </div>
  );
}
