"use client";

import { Badge } from "@web/components/ui/badge";
import { cn } from "@web/lib/utils";
import { CheckCircle, Lock, Star, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

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
  style?: React.CSSProperties;
}

const rarityColors = {
  common: "bg-gray-100 text-gray-800 border-gray-200",
  rare: "bg-blue-100 text-blue-800 border-blue-200",
  epic: "bg-purple-100 text-purple-800 border-purple-200",
  legendary: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200",
};

const rarityGradients = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 via-orange-400 to-red-500",
};

const categoryColors = {
  fixer: "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200",
  reporter: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
  sponsor: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
  community: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200",
};

export function BadgeCard({ badge, style }: BadgeCardProps) {
  const isLocked = !badge.isObtained;
  const progressPercentage = badge.maxProgress > 0 ? (badge.progress / badge.maxProgress) * 100 : 0;
  const [isHovered, setIsHovered] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  return (
    <div 
      className={cn(
        "relative transition-all duration-300 hover:shadow-lg group cursor-pointer overflow-hidden h-20 w-full rounded-lg border",
        isLocked 
          ? "opacity-60 grayscale hover:opacity-70 bg-gray-200 border-gray-300" 
          : "opacity-100 hover:scale-105 bg-white border-gray-200",
        categoryColors[badge.category as keyof typeof categoryColors] || "bg-gray-50 border-gray-200"
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="p-1.5 relative z-10 h-full flex flex-col">
        {/* Badge Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-xs transition-colors line-clamp-1 truncate",
              isLocked ? "text-gray-500" : "text-gray-900 group-hover:text-gray-700"
            )}>
              {badge.name}
            </h3>
          </div>
          
          {/* Points with gradient */}
          <div className="text-right ml-1">
            <div className={cn(
              "text-xs font-bold",
              isLocked 
                ? "text-gray-400" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            )}>
              {badge.points}
            </div>
          </div>
        </div>

        {/* Icon and Description Row */}
        <div className="flex items-center gap-2 flex-1">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm transition-all duration-300",
              isLocked 
                ? "bg-gray-200 text-gray-400" 
                : "bg-white border border-gray-200 text-gray-600 group-hover:shadow-md group-hover:scale-105"
            )}>
              {badge.icon || "🏆"}
            </div>
            
            {/* Sparkle effect for obtained badges */}
            {!isLocked && isHovered && (
              <div className="absolute -top-0.5 -right-0.5">
                <Sparkles className="h-2 w-2 text-yellow-500 animate-pulse" />
              </div>
            )}
            
            {/* Completion checkmark */}
            {badge.isCompleted && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-2 w-2 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <p className={cn(
            "text-xs line-clamp-2 leading-tight flex-1",
            isLocked ? "text-gray-400" : "text-gray-600"
          )}>
            {badge.description}
          </p>
        </div>

        {/* Progress Bar (only show if not completed) */}
        {!badge.isCompleted && badge.maxProgress > 1 && (
          <div className="mt-1">
            <div className="relative w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div 
                className={cn(
                  "h-1 rounded-full transition-all duration-1000 ease-out relative",
                  isLocked 
                    ? "bg-gray-300" 
                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                )}
                style={{ width: `${Math.min(animatedProgress, 100)}%` }}
              >
                {/* Shimmer effect */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion Status */}
        {badge.isCompleted && (
          <div className="mt-1">
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold shadow-sm px-1.5 py-0.5"
            >
              <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
              Done
            </Badge>
          </div>
        )}

        {/* Enhanced Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-1">
                <Lock className="h-3 w-3 text-white" />
              </div>
              <p className="text-xs text-gray-500 font-medium">Locked</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
