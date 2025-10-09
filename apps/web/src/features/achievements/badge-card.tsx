"use client";

import { Badge } from "@web/components/ui/badge";
import { cn } from "@web/lib/utils";
import {
	Award,
	Bug,
	CheckCircle,
	Code,
	Coffee,
	Crown,
	DollarSign,
	Flame,
	Gem,
	GitPullRequest,
	Heart,
	Lock,
	MessageCircle,
	MessageSquare,
	Shield,
	Star,
	Target,
	Trophy,
	Users,
	UsersRound,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

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
	legendary:
		"bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-900 border-amber-200/30",
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
	const progressPercentage =
		badge.maxProgress > 0 ? (badge.progress / badge.maxProgress) * 100 : 0;
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
				"group relative h-24 w-full cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300",
				isLocked
					? "border-slate-300/20 bg-white/5 opacity-40 hover:opacity-55"
					: "bg-white/10 opacity-100 hover:scale-[1.01] hover:bg-white/15",
				categoryColors[badge.category as keyof typeof categoryColors] ||
					"border-slate-200/20 bg-slate-50/5",
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
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-indigo-500/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			)}

			<div className="relative z-10 flex h-full flex-col p-3">
				{/* Modern Header with Icon */}
				<div className="mb-2 flex items-start gap-3">
					{/* Glassmorphism Icon Container */}
					<div className="relative flex-shrink-0">
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-2xl border backdrop-blur-md transition-all duration-300",
								isLocked
									? "border-slate-300/20 bg-white/10 text-slate-400"
									: "border-white/30 bg-white/20 text-black group-hover:scale-105 group-hover:bg-white/30",
							)}
						>
							<IconComponent className="h-5 w-5 stroke-[1.5]" />
						</div>

						{/* Completion checkmark */}
						{badge.isCompleted && (
							<div className="-bottom-1 -right-1 absolute">
								<div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-green-500 to-emerald-500">
									<CheckCircle className="h-2.5 w-2.5 text-white" />
								</div>
							</div>
						)}
					</div>

					{/* Badge Info */}
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center justify-between">
							<h3
								className={cn(
									"truncate font-bold text-sm transition-colors",
									isLocked ? "text-gray-500" : "text-gray-900",
								)}
							>
								{badge.name}
							</h3>

							{/* Points Badge */}
							<div
								className={cn(
									"rounded-xl border px-2 py-0.5 font-medium text-xs backdrop-blur-md",
									isLocked
										? "border-slate-300/20 bg-white/10 text-slate-400"
										: "border-white/30 bg-white/20 text-slate-700",
								)}
							>
								{badge.points}
							</div>
						</div>

						{/* Description */}
						<p
							className={cn(
								"line-clamp-2 text-xs leading-tight",
								isLocked ? "text-gray-400" : "text-gray-600",
							)}
						>
							{badge.description}
						</p>
					</div>
				</div>

				{/* Glassmorphism Progress Bar */}
				{!badge.isCompleted && badge.maxProgress > 1 && (
					<div className="mt-auto">
						<div className="mb-1 flex items-center justify-between text-xs">
							<span
								className={cn(
									"font-medium",
									isLocked ? "text-gray-400" : "text-gray-600",
								)}
							>
								{badge.progress}/{badge.maxProgress}
							</span>
							<span
								className={cn(
									"font-medium",
									isLocked ? "text-gray-400" : "text-gray-600",
								)}
							>
								{Math.round(progressPercentage)}%
							</span>
						</div>
						<div className="relative h-1.5 w-full overflow-hidden rounded-full border border-white/20 bg-white/15 shadow-inner backdrop-blur-md">
							<div
								className={cn(
									"relative h-1.5 rounded-full transition-all duration-1000 ease-out",
									isLocked
										? "bg-slate-300/30"
										: "bg-gradient-to-r from-blue-500/70 to-purple-500/70",
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
						<div className="inline-flex items-center rounded-xl border border-emerald-300/25 bg-gradient-to-r from-emerald-500/15 to-green-500/15 px-2 py-1 font-medium text-emerald-800 text-xs backdrop-blur-md">
							<CheckCircle className="mr-1 h-3 w-3 stroke-[1.5]" />
							Completed
						</div>
					</div>
				)}

				{/* Enhanced glassmorphism locked overlay */}
				{isLocked && (
					<div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10 backdrop-blur-xl">
						<div className="text-center">
							<div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md">
								<Lock className="h-4 w-4 stroke-[1.5] text-slate-500" />
							</div>
							<p className="font-medium text-slate-500 text-xs">Locked</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
