"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Trophy, Star, Target, Heart, DollarSign } from "lucide-react";

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  level?: number;
  experiencesAdded?: number;
  experiencesFixed?: number;
  experiencesVerified?: number;
  experiencesSponsored?: number;
  count?: number; // For category-specific leaderboards
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const categories: LeaderboardCategory[] = [
  { id: "overall", name: "Overall", icon: Trophy, color: "bg-yellow-500" },
  { id: "experiencesAdded", name: "Experience Reporters", icon: Target, color: "bg-blue-500" },
  { id: "experiencesFixed", name: "Problem Solvers", icon: Star, color: "bg-green-500" },
  { id: "experiencesVerified", name: "Verifiers", icon: Heart, color: "bg-purple-500" },
  { id: "experiencesSponsored", name: "Sponsors", icon: DollarSign, color: "bg-orange-500" },
];

interface LeaderboardCardProps {
  users: LeaderboardUser[];
  category: string;
  showActivityBreakdown?: boolean;
}

export function LeaderboardCard({ users, category, showActivityBreakdown = false }: LeaderboardCardProps) {
  const currentCategory = categories.find(cat => cat.id === category);
  const Icon = currentCategory?.icon || Trophy;

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 scale-110";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md shadow-gray-400/30";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-400/30";
    return "bg-muted";
  };

  const getPointsAnimation = (rank: number) => {
    if (rank <= 3) return "animate-pulse-gaming";
    return "";
  };

  return (
    <Card className="shadow-none relative overflow-hidden">
      {/* Gaming background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 opacity-30" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${currentCategory?.color === 'bg-yellow-500' ? 'text-yellow-600' : ''}`} />
          {currentCategory?.name} Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="max-h-96 overflow-y-auto space-y-2 p-6">
          {users.map((user, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-md group ${
                  isTopThree ? 'border-2' : 'border'
                } ${
                  rank === 1 ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' :
                  rank === 2 ? 'border-gray-400 bg-gray-50/50 dark:bg-gray-900/10' :
                  rank === 3 ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/10' :
                  'bg-card hover:bg-accent/50'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${getRankStyle(rank)} ${
                    isTopThree ? 'animate-bounce-soft' : ''
                  }`}>
                    <span className={`font-bold ${isTopThree ? 'text-lg' : 'text-sm'}`}>
                      {rank}
                    </span>
                  </div>

                  {/* Avatar with glow for top 3 */}
                  <div className="relative">
                    <Avatar className={`h-10 w-10 ${isTopThree ? 'ring-2 ring-offset-2' : ''} ${
                      rank === 1 ? 'ring-yellow-400' :
                      rank === 2 ? 'ring-gray-400' :
                      rank === 3 ? 'ring-orange-400' : ''
                    }`}>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className={isTopThree ? 'font-bold' : ''}>
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isTopThree && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse-gaming ${
                        rank === 1 ? 'bg-yellow-400' :
                        rank === 2 ? 'bg-gray-400' :
                        'bg-orange-400'
                      }`} />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="animate-slideIn">
                    <h3 className={`font-semibold text-sm ${isTopThree ? 'text-base' : ''}`}>
                      {user.name}
                    </h3>
                    {category === "overall" && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-xs transition-all duration-300 group-hover:scale-105 ${
                          isTopThree ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300' : ''
                        }`}>
                          Level {user.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {user.totalPoints} points
                        </span>
                      </div>
                    )}
                    {category !== "overall" && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">{user.count}</span> {category === "experiencesAdded" ? "reports" : 
                         category === "experiencesFixed" ? "fixes" :
                         category === "experiencesVerified" ? "verifications" : "sponsorships"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Points/Count with animation */}
                <div className="text-right">
                  <div className={`font-bold text-lg ${getPointsAnimation(rank)} ${
                    isTopThree ? 'text-xl' : ''
                  }`}>
                    {category === "overall" ? user.totalPoints : (user.count || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category === "overall" ? "total points" : 
                     category === "experiencesAdded" ? "reports" :
                     category === "experiencesFixed" ? "fixes" :
                     category === "experiencesVerified" ? "verifications" : "sponsorships"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes pulse-gaming {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }
        
        .animate-pulse-gaming {
          animation: pulse-gaming 2s ease-in-out infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}
