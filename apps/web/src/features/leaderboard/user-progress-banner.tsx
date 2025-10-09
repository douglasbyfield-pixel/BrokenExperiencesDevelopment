"use client";

import { Badge } from "@web/components/ui/badge";
import { Card, CardContent } from "@web/components/ui/card";
import { Progress } from "@web/components/ui/progress";
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
		<Card className="group relative overflow-hidden border-gray-200 bg-gray-50 shadow-none transition-all duration-300 hover:shadow-md">
			{/* Gaming background pattern */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-5" />

			<CardContent className="relative z-10 p-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="animate-fadeIn font-semibold text-gray-900 text-lg">
							Your Leaderboard Position!
						</h3>
						<p className="animate-slideInLeft text-gray-600 text-sm">
							{userName}, you're currently ranked{" "}
							<span
								className={`inline-block font-semibold text-blue-600 transition-all duration-500 ${
									rankPulse ? "scale-125 text-shadow-gaming" : ""
								}`}
							>
								#{userRank}
							</span>{" "}
							out of <span className="font-semibold">{totalUsers}</span> users
						</p>
					</div>

					<div className="animate-slideInRight text-right">
						<div className="mb-2 transform transition-transform duration-200 hover:scale-105">
							<Badge
								variant="secondary"
								className="animate-pulse-soft border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-sm"
							>
								Level {currentLevel}
							</Badge>
						</div>
						<div className="text-gray-600 text-sm">
							<span className="font-bold font-mono text-gray-800 transition-all duration-300">
								{animatedPoints}
							</span>
							<span className="text-gray-500"> / {nextLevelPoints} points</span>
						</div>
					</div>
				</div>

				<div className="mt-4">
					<div className="animation-delay-200 mb-2 flex animate-fadeIn justify-between text-gray-600 text-sm">
						<span>Progress to Level {currentLevel + 1}</span>
						<span className="font-semibold">
							{pointsToNextLevel} points to go
						</span>
					</div>
					<div className="relative">
						<Progress
							value={animatedProgress}
							className="h-3 overflow-hidden bg-gray-200"
						/>
						{/* Animated shine effect */}
						<div className="absolute inset-0 h-3 overflow-hidden rounded-full">
							<div className="h-full w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
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
