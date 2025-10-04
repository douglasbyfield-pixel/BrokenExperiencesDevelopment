"use client";

import { Card, CardContent } from "@web/components/ui/card";
import { Progress } from "@web/components/ui/progress";
import { Badge } from "@web/components/ui/badge";
import { useEffect, useState } from "react";

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
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [rankPulse, setRankPulse] = useState(false);
  
  const progressPercentage = (currentPoints / nextLevelPoints) * 100;
  const pointsToNextLevel = nextLevelPoints - currentPoints;

  useEffect(() => {
    // Animate progress bar
    const progressTimer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 100);

    // Animate points counter
    const duration = 1000;
    const steps = 30;
    const increment = currentPoints / steps;
    let current = 0;
    
    const pointsTimer = setInterval(() => {
      current += increment;
      if (current >= currentPoints) {
        setAnimatedPoints(currentPoints);
        clearInterval(pointsTimer);
      } else {
        setAnimatedPoints(Math.floor(current));
      }
    }, duration / steps);

    // Pulse rank animation
    setRankPulse(true);
    const pulseTimer = setTimeout(() => setRankPulse(false), 600);

    return () => {
      clearTimeout(progressTimer);
      clearInterval(pointsTimer);
      clearTimeout(pulseTimer);
    };
  }, [currentPoints, progressPercentage]);

  return (
    <Card className="bg-gray-50 border-gray-200 shadow-none relative overflow-hidden group hover:shadow-md transition-all duration-300">
      {/* Gaming background pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-500 to-purple-500" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 animate-fadeIn">
              Your Leaderboard Position!
            </h3>
            <p className="text-sm text-gray-600 animate-slideInLeft">
              {userName}, you're currently ranked{" "}
              <span className={`font-semibold text-blue-600 inline-block transition-all duration-500 ${
                rankPulse ? 'scale-125 text-shadow-gaming' : ''
              }`}>
                #{userRank}
              </span>{" "}
              out of{" "}
              <span className="font-semibold">{totalUsers}</span> users
            </p>
          </div>
          
          <div className="text-right animate-slideInRight">
            <div className="mb-2 transform hover:scale-105 transition-transform duration-200">
              <Badge variant="secondary" className="text-sm bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 animate-pulse-soft">
                Level {currentLevel}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-mono font-bold text-gray-800 transition-all duration-300">
                {animatedPoints}
              </span>
              <span className="text-gray-500"> / {nextLevelPoints} points</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2 animate-fadeIn animation-delay-200">
            <span>Progress to Level {currentLevel + 1}</span>
            <span className="font-semibold">{pointsToNextLevel} points to go</span>
          </div>
          <div className="relative">
            <Progress 
              value={animatedProgress} 
              className="h-3 bg-gray-200 overflow-hidden"
            />
            {/* Animated shine effect */}
            <div className="absolute inset-0 h-3 overflow-hidden rounded-full">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .text-shadow-gaming {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </Card>
  );
}
