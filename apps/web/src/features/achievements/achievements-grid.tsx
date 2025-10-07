"use client";

import { BadgeCard, type BadgeData } from "./badge-card";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { Trophy, Target, DollarSign, Users, Sparkles, Award, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface AchievementsGridProps {
  badges: BadgeData[];
  loading?: boolean;
}

const categoryInfo = {
  fixer: {
    name: "Fixer",
    icon: Target,
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    borderColor: "border-emerald-200",
    gradient: "from-emerald-500 to-green-600",
  },
  reporter: {
    name: "Reporter", 
    icon: Star,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    gradient: "from-blue-500 to-indigo-600",
  },
  sponsor: {
    name: "Sponsor",
    icon: DollarSign,
    color: "text-amber-600", 
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
    gradient: "from-amber-500 to-orange-600",
  },
  community: {
    name: "Community",
    icon: Users,
    color: "text-violet-600",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50", 
    borderColor: "border-violet-200",
    gradient: "from-violet-500 to-purple-600",
  },
};

export function AchievementsGrid({ badges, loading = false }: AchievementsGridProps) {
  const [animatedCount, setAnimatedCount] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const obtainedCount = badges.filter(badge => badge.isObtained).length;
  const totalCount = badges.length;

  useEffect(() => {
    if (!loading && badges.length > 0) {
      // Animate the count
      const duration = 1500;
      const steps = 30;
      const increment = obtainedCount / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= obtainedCount) {
          setAnimatedCount(obtainedCount);
          clearInterval(timer);
        } else {
          setAnimatedCount(Math.floor(current));
        }
      }, duration / steps);

      // Show stats after a delay
      setTimeout(() => setShowStats(true), 200);

      return () => clearInterval(timer);
    }
  }, [loading, badges, obtainedCount]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <Card className="bg-gray-50 border-gray-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Skeleton */}
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

  return (
    <div className="space-y-8">
      {/* Stats Summary Card */}
      <Card className="bg-gray-50 border-gray-200 shadow-none relative overflow-hidden group hover:shadow-md transition-all duration-300">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                {/* Sparkle effects */}
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <div className={`transition-all duration-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Your Progress</h2>
                <p className="text-gray-600">Track your achievement journey</p>
              </div>
            </div>
            
            <div className={`text-right transition-all duration-700 delay-200 ${showStats ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {animatedCount}
                </span>
                <span className="text-xl font-semibold text-gray-400">/</span>
                <span className="text-xl font-semibold text-gray-600">{totalCount}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">Badges Unlocked</div>
              
              {/* Progress ring */}
              <div className="mt-3 relative w-14 h-14 mx-auto">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${(animatedCount / totalCount) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    style={{ transition: 'stroke-dasharray 1.5s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {Math.round((animatedCount / totalCount) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {Object.entries(badgesByCategory).map(([category, categoryBadges], categoryIndex) => {
        const categoryData = categoryInfo[category as keyof typeof categoryInfo];
        const Icon = categoryData?.icon || Trophy;
        const obtainedInCategory = categoryBadges.filter(badge => badge.isObtained).length;
        const completionPercentage = Math.round((obtainedInCategory / categoryBadges.length) * 100);

        return (
          <div key={category} className="space-y-6">
            {/* Enhanced Category Header */}
            <div className="relative">
              <Card className="bg-white border-gray-200 shadow-none hover:shadow-sm transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`relative p-3 rounded-2xl ${categoryData?.bgColor} ${categoryData?.borderColor} border shadow-sm`}>
                        <Icon className={`h-6 w-6 ${categoryData?.color}`} />
                        {/* Subtle glow effect */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${categoryData?.gradient} opacity-10 blur-sm`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {categoryData?.name} Badges
                        </h3>
                        <p className="text-sm text-gray-600">
                          {obtainedInCategory} of {categoryBadges.length} unlocked
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`text-sm font-semibold ${
                          completionPercentage === 100 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : completionPercentage >= 50
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {completionPercentage}% Complete
                      </Badge>
                      
                      {/* Category progress bar */}
                      <div className="mt-2 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${categoryData?.gradient} transition-all duration-1000 ease-out`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {categoryBadges.map((badge, badgeIndex) => (
                <BadgeCard 
                  key={badge.id} 
                  badge={badge}
                  style={{
                    animationDelay: `${(categoryIndex * 100) + (badgeIndex * 50)}ms`
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
