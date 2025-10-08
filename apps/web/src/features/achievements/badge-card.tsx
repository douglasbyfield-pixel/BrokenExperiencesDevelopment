"use client";

import { Badge } from "@web/components/ui/badge";
import { cn } from "@web/lib/utils";
import { CheckCircle, Lock, Star, Trophy, Target, Users, MessageCircle, Heart, Award, Zap, Shield, Crown, Gem, Flame, Coffee, Code, Bug, GitPullRequest, MessageSquare, DollarSign, UsersRound } from "lucide-react";
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
  common: "bg-white/10 text-slate-800 border-slate-200/20",
  rare: "bg-blue-500/10 text-blue-900 border-blue-200/30",
  epic: "bg-purple-500/10 text-purple-900 border-purple-200/30",
  legendary: "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-900 border-amber-200/30",
};

const rarityGradients = {
  common: "from-slate-400/20 to-slate-600/20",
  rare: "from-blue-400/20 to-blue-600/20",
  epic: "from-purple-400/20 to-purple-600/20",
  legendary: "from-amber-400/20 via-orange-400/20 to-red-500/20",
};

// Icon mapping for different badge types - all black Lucide icons
const iconMap: Record<string, any> = {
  trophy: Trophy,
  target: Target,
  users: Users,
  message: MessageCircle,
  heart: Heart,
  award: Award,
  zap: Zap,
  shield: Shield,
  star: Star,
  crown: Crown,
  gem: Gem,
  flame: Flame,
  coffee: Coffee,
  code: Code,
  bug: Bug,
  pullrequest: GitPullRequest,
  chat: MessageSquare,
  sponsor: DollarSign,
  community: UsersRound,
};

const categoryColors = {
  fixer: "border-emerald-300/20 bg-emerald-50/5",
  reporter: "border-blue-300/20 bg-blue-50/5", 
  sponsor: "border-amber-300/20 bg-amber-50/5",
  community: "border-violet-300/20 bg-violet-50/5",
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

  // Get the appropriate icon
  const IconComponent = iconMap[badge.icon?.toLowerCase()] || Trophy;

  return (
    <div 
      className={cn(
        "relative transition-all duration-300 group cursor-pointer overflow-hidden h-24 w-full rounded-2xl border backdrop-blur-xl",
        isLocked 
          ? "opacity-40 hover:opacity-55 bg-white/5 border-slate-300/20" 
          : "opacity-100 hover:scale-[1.01] bg-white/10 hover:bg-white/15",
        categoryColors[badge.category as keyof typeof categoryColors] || "border-slate-200/20 bg-slate-50/5"
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/8 to-white/3" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
      
      {/* Subtle hover enhancement */}
      {!isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      <div className="p-3 relative z-10 h-full flex flex-col">
        {/* Modern Header with Icon */}
        <div className="flex items-start gap-3 mb-2">
          {/* Glassmorphism Icon Container */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all duration-300",
              isLocked 
                ? "bg-white/10 border-slate-300/20 text-slate-400" 
                : "bg-white/20 border-white/30 text-black group-hover:bg-white/30 group-hover:scale-105"
            )}>
              <IconComponent className="h-5 w-5 stroke-[1.5]" />
            </div>
            
            
            {/* Completion checkmark */}
            {badge.isCompleted && (
              <div className="absolute -bottom-1 -right-1">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={cn(
                "font-bold text-sm transition-colors truncate",
                isLocked ? "text-gray-500" : "text-gray-900"
              )}>
                {badge.name}
              </h3>
              
              {/* Points Badge */}
              <div className={cn(
                "px-2 py-0.5 rounded-xl text-xs font-medium backdrop-blur-md border",
                isLocked 
                  ? "bg-white/10 border-slate-300/20 text-slate-400" 
                  : "bg-white/20 border-white/30 text-slate-700"
              )}>
                {badge.points}
              </div>
            </div>
            
            {/* Description */}
            <p className={cn(
              "text-xs leading-tight line-clamp-2",
              isLocked ? "text-gray-400" : "text-gray-600"
            )}>
              {badge.description}
            </p>
          </div>
        </div>

        {/* Glassmorphism Progress Bar */}
        {!badge.isCompleted && badge.maxProgress > 1 && (
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={cn(
                "font-medium",
                isLocked ? "text-gray-400" : "text-gray-600"
              )}>
                {badge.progress}/{badge.maxProgress}
              </span>
              <span className={cn(
                "font-medium",
                isLocked ? "text-gray-400" : "text-gray-600"
              )}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="relative w-full bg-white/15 backdrop-blur-md rounded-full h-1.5 overflow-hidden border border-white/20 shadow-inner">
              <div 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-1000 ease-out relative",
                  isLocked 
                    ? "bg-slate-300/30" 
                    : "bg-gradient-to-r from-blue-500/70 to-purple-500/70"
                )}
                style={{ width: `${Math.min(animatedProgress, 100)}%` }}
              >
                {/* Subtle shimmer effect */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Glassmorphism Completion Badge */}
        {badge.isCompleted && (
          <div className="mt-auto">
            <div className="inline-flex items-center px-2 py-1 rounded-xl bg-gradient-to-r from-emerald-500/15 to-green-500/15 backdrop-blur-md border border-emerald-300/25 text-xs font-medium text-emerald-800">
              <CheckCircle className="h-3 w-3 mr-1 stroke-[1.5]" />
              Completed
            </div>
          </div>
        )}

        {/* Enhanced glassmorphism locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-xl rounded-2xl">
            <div className="text-center">
              <div className="w-8 h-8 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/25">
                <Lock className="h-4 w-4 text-slate-500 stroke-[1.5]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Locked</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
