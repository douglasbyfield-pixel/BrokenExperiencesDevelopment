"use client";

import { BadgeCard, type BadgeData } from "./badge-card";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { Trophy, Target, DollarSign, Users } from "lucide-react";

interface AchievementsGridProps {
  badges: BadgeData[];
  loading?: boolean;
}

const categoryInfo = {
  fixer: {
    name: "Fixer",
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  reporter: {
    name: "Reporter", 
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  sponsor: {
    name: "Sponsor",
    icon: DollarSign,
    color: "text-orange-600", 
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  community: {
    name: "Community",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50", 
    borderColor: "border-purple-200",
  },
};

export function AchievementsGrid({ badges, loading = false }: AchievementsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded-full w-12 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, BadgeData[]>);

  const obtainedCount = badges.filter(badge => badge.isObtained).length;
  const totalCount = badges.length;

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
                <p className="text-gray-600">Unlock badges by completing activities</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {obtainedCount}/{totalCount}
              </div>
              <div className="text-sm text-gray-600">Badges Unlocked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
        const categoryData = categoryInfo[category as keyof typeof categoryInfo];
        const Icon = categoryData?.icon || Trophy;
        const obtainedInCategory = categoryBadges.filter(badge => badge.isObtained).length;

        return (
          <div key={category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${categoryData?.bgColor} ${categoryData?.borderColor} border`}>
                  <Icon className={`h-5 w-5 ${categoryData?.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {categoryData?.name} Badges
                  </h3>
                  <p className="text-sm text-gray-600">
                    {obtainedInCategory}/{categoryBadges.length} unlocked
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {Math.round((obtainedInCategory / categoryBadges.length) * 100)}% Complete
              </Badge>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
