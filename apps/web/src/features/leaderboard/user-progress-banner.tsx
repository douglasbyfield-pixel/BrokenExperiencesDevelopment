"use client";

import { Card, CardContent } from "@web/components/ui/card";
import { Progress } from "@web/components/ui/progress";
import { Badge } from "@web/components/ui/badge";

interface UserProgressBannerProps {
  userRank: number;
  totalUsers: number;
  currentPoints: number;
  nextLevelPoints: number;
  currentLevel: number;
  userName: string;
}

export function UserProgressBanner({
  userRank,
  totalUsers,
  currentPoints,
  nextLevelPoints,
  currentLevel,
  userName,
}: UserProgressBannerProps) {
  const progressPercentage = (currentPoints / nextLevelPoints) * 100;
  const pointsToNextLevel = nextLevelPoints - currentPoints;

  return (
    <Card className="bg-gray-50 border-gray-200 shadow-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your Leaderboard Position
            </h3>
            <p className="text-sm text-gray-600">
              {userName}, you're currently ranked{" "}
              <span className="font-semibold text-blue-600">#{userRank}</span> out of{" "}
              <span className="font-semibold">{totalUsers}</span> users
            </p>
          </div>
          
          <div className="text-right">
            <div className="mb-2">
              <Badge variant="secondary" className="text-sm">
                Level {currentLevel}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {currentPoints} / {nextLevelPoints} points
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to Level {currentLevel + 1}</span>
            <span>{pointsToNextLevel} points to go</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 [&>div]:bg-blue-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
