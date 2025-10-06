"use client";

import { Card, CardContent } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { cn } from "@web/lib/utils";

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement: number;
  requirementType: string;
  rarity: string;
  isHidden: boolean;
  createdAt: string;
  // User-specific status
  isObtained: boolean;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  unlockedAt: string | null;
}

interface BadgeCardProps {
  badge: BadgeData;
}

const rarityColors = {
  common: "bg-gray-100 text-gray-800",
  rare: "bg-blue-100 text-blue-800",
  epic: "bg-purple-100 text-purple-800",
  legendary: "bg-yellow-100 text-yellow-800",
};

const categoryColors = {
  fixer: "bg-green-50 border-green-200",
  reporter: "bg-blue-50 border-blue-200",
  sponsor: "bg-orange-50 border-orange-200",
  community: "bg-purple-50 border-purple-200",
};

export function BadgeCard({ badge }: BadgeCardProps) {
  const isLocked = !badge.isObtained;
  const progressPercentage = badge.maxProgress > 0 ? (badge.progress / badge.maxProgress) * 100 : 0;

  return (
    <Card 
      className={cn(
        "relative transition-all duration-200 hover:shadow-md",
        isLocked 
          ? "opacity-50 grayscale" 
          : "opacity-100",
        categoryColors[badge.category as keyof typeof categoryColors] || "bg-gray-50 border-gray-200"
      )}
    >
      <CardContent className="p-4">
        {/* Badge Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-sm mb-1",
              isLocked ? "text-gray-500" : "text-gray-900"
            )}>
              {badge.name}
            </h3>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                rarityColors[badge.rarity as keyof typeof rarityColors] || "bg-gray-100 text-gray-800"
              )}
            >
              {badge.rarity}
            </Badge>
          </div>
          
          {/* Points */}
          <div className="text-right">
            <div className={cn(
              "text-xs font-medium",
              isLocked ? "text-gray-400" : "text-gray-600"
            )}>
              {badge.points} pts
            </div>
          </div>
        </div>

        {/* Icon Placeholder */}
        <div className="flex justify-center mb-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
            isLocked 
              ? "bg-gray-200 text-gray-400" 
              : "bg-white border-2 border-gray-200 text-gray-600"
          )}>
            {badge.icon || "🏆"}
          </div>
        </div>

        {/* Description */}
        <p className={cn(
          "text-xs text-center mb-3 line-clamp-2",
          isLocked ? "text-gray-400" : "text-gray-600"
        )}>
          {badge.description}
        </p>

        {/* Progress Bar (only show if not completed) */}
        {!badge.isCompleted && badge.maxProgress > 1 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={cn(
                isLocked ? "text-gray-400" : "text-gray-600"
              )}>
                Progress
              </span>
              <span className={cn(
                isLocked ? "text-gray-400" : "text-gray-600"
              )}>
                {badge.progress}/{badge.maxProgress}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isLocked 
                    ? "bg-gray-300" 
                    : "bg-blue-500"
                )}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Completion Status */}
        {badge.isCompleted && (
          <div className="text-center">
            <Badge variant="default" className="bg-green-500 text-white text-xs">
              ✓ Completed
            </Badge>
          </div>
        )}

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
            <div className="text-white text-2xl">🔒</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
