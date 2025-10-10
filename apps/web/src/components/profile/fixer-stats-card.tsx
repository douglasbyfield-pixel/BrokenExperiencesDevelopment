"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { Progress } from "@web/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  Wrench, 
  Shield, 
  TrendingUp,
  Star,
  Award,
  Target
} from "lucide-react";

interface FixerStatsCardProps {
  fixerStats: {
    totalClaimed: number;
    totalCompleted: number;
    totalVerified: number;
    averageTimeToComplete: number; // in days
    completionRate: number; // percentage
    verificationRate: number; // percentage
    impactScore: number;
    totalPointsEarned: number;
    recentFixes: Array<{
      id: string;
      experienceTitle: string;
      status: string;
      completedAt?: string;
      verificationCount: number;
    }>;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      earnedAt: string;
      icon: string;
    }>;
  };
  className?: string;
}

export function FixerStatsCard({ fixerStats, className = "" }: FixerStatsCardProps) {
  const {
    totalClaimed,
    totalCompleted,
    totalVerified,
    averageTimeToComplete,
    completionRate,
    verificationRate,
    impactScore,
    totalPointsEarned,
    recentFixes,
    badges
  } = fixerStats;

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getVerificationColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getFixerLevel = (points: number) => {
    if (points >= 5000) return { level: "Expert", color: "bg-purple-100 text-purple-800" };
    if (points >= 2000) return { level: "Advanced", color: "bg-blue-100 text-blue-800" };
    if (points >= 500) return { level: "Intermediate", color: "bg-green-100 text-green-800" };
    return { level: "Beginner", color: "bg-gray-100 text-gray-800" };
  };

  const fixerLevel = getFixerLevel(totalPointsEarned);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-green-600" />
            Fixer Profile
          </CardTitle>
          <Badge className={fixerLevel.color}>
            {fixerLevel.level} Fixer
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalClaimed}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Claimed
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalVerified}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Verified
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{impactScore}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Impact
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className={`text-sm font-semibold ${getCompletionColor(completionRate)}`}>
                {completionRate}%
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {totalCompleted} of {totalClaimed} claimed issues completed
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Verification Rate</span>
              <span className={`text-sm font-semibold ${getVerificationColor(verificationRate)}`}>
                {verificationRate}%
              </span>
            </div>
            <Progress value={verificationRate} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {totalVerified} of {totalCompleted} completed fixes verified by community
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Average Time to Complete</span>
            <span className="text-sm font-semibold text-gray-700">
              {averageTimeToComplete} days
            </span>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              Achievements ({badges.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((badge) => (
                <Badge 
                  key={badge.id} 
                  variant="outline" 
                  className="bg-yellow-50 border-yellow-200 text-yellow-800"
                >
                  <Star className="h-3 w-3 mr-1" />
                  {badge.name}
                </Badge>
              ))}
              {badges.length > 6 && (
                <Badge variant="outline" className="text-gray-600">
                  +{badges.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Fixes */}
        {recentFixes.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Recent Fixes ({recentFixes.length})
            </h4>
            <div className="space-y-2">
              {recentFixes.slice(0, 5).map((fix) => (
                <div 
                  key={fix.id} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {fix.experienceTitle}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fix.completedAt ? 
                        `Completed ${new Date(fix.completedAt).toLocaleDateString()}` :
                        `Status: ${fix.status}`
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Shield className="h-3 w-3" />
                    {fix.verificationCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Level Progress */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Progress to {fixerLevel.level === "Expert" ? "Legend" : "Next Level"}
            </span>
            <span className="text-sm text-blue-700">
              {totalPointsEarned} / {fixerLevel.level === "Expert" ? "10000" : "5000"} points
            </span>
          </div>
          <Progress 
            value={fixerLevel.level === "Expert" ? 
              (totalPointsEarned / 10000) * 100 : 
              ((totalPointsEarned % 2500) / 2500) * 100
            } 
            className="h-2" 
          />
        </div>
      </CardContent>
    </Card>
  );
}