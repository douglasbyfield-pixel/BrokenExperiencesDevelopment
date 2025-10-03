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

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {currentCategory?.name} Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto space-y-4 p-6">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  <span className="text-sm font-semibold">
                    {index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div>
                  <h3 className="font-semibold text-sm">{user.name}</h3>
                  {category === "overall" && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Level {user.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.totalPoints} points
                      </span>
                    </div>
                  )}
                  {category !== "overall" && (
                    <p className="text-xs text-muted-foreground">
                      {user.count} {category === "experiencesAdded" ? "reports" : 
                       category === "experiencesFixed" ? "fixes" :
                       category === "experiencesVerified" ? "verifications" : "sponsorships"}
                    </p>
                  )}
                </div>
              </div>

              {/* Points/Count */}
              <div className="text-right">
                <div className="font-semibold">
                  {category === "overall" ? user.totalPoints : user.totalPoints}
                </div>
                <div className="text-xs text-muted-foreground">
                  {category === "overall" ? "total points" : "points"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
