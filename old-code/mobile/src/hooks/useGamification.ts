import { useCallback, useEffect, useState } from "react";
import { Animated } from "react-native";
import { useAuth } from "../context/AuthContext";
import { DataService } from "../services/dataService";

export interface UserStats {
	level: number;
	experience: number;
	totalPoints: number;
	streak: number;
	issuesReported: number;
	issuesUpvoted: number;
	commentsPosted: number;
	achievements: Achievement[];
	lastActiveDate: string;
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	points: number;
	unlockedAt: string;
	category: "reporting" | "engagement" | "consistency" | "impact";
}

export interface LevelConfig {
	level: number;
	requiredXP: number;
	title: string;
	badge: string;
	perks: string[];
}

const LEVEL_CONFIGS: LevelConfig[] = [
	{
		level: 1,
		requiredXP: 0,
		title: "New Citizen",
		badge: "🆕",
		perks: ["Can report issues"],
	},
	{
		level: 2,
		requiredXP: 100,
		title: "Community Helper",
		badge: "🤝",
		perks: ["Can comment on issues"],
	},
	{
		level: 3,
		requiredXP: 300,
		title: "Local Champion",
		badge: "🏆",
		perks: ["Priority issue highlighting"],
	},
	{
		level: 4,
		requiredXP: 600,
		title: "Issue Hunter",
		badge: "🎯",
		perks: ["Advanced filtering options"],
	},
	{
		level: 5,
		requiredXP: 1000,
		title: "Community Leader",
		badge: "👑",
		perks: ["Can moderate discussions"],
	},
	{
		level: 6,
		requiredXP: 1500,
		title: "Change Maker",
		badge: "⭐",
		perks: ["Direct contact with authorities"],
	},
	{
		level: 7,
		requiredXP: 2500,
		title: "Jamaica Guardian",
		badge: "🛡️",
		perks: ["Special recognition badge"],
	},
];

export const useGamification = () => {
	const { user } = useAuth();
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [loading, setLoading] = useState(true);

	// Animation values
	const [pointsAnimation] = useState(new Animated.Value(0));
	const [levelUpAnimation] = useState(new Animated.Value(0));
	const [achievementAnimation] = useState(new Animated.Value(0));

	const loadUserStats = useCallback(async () => {
		if (!user) {
			setLoading(false);
			return;
		}

		try {
			const stats = await DataService.getUserStats(user.id);
			setUserStats(stats);
		} catch (error) {
			console.error("Error loading user stats:", error);
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		loadUserStats();
	}, [loadUserStats]);

	const calculateLevel = useCallback((experience: number): LevelConfig => {
		let currentLevel = LEVEL_CONFIGS[0];

		for (const levelConfig of LEVEL_CONFIGS) {
			if (experience >= levelConfig.requiredXP) {
				currentLevel = levelConfig;
			} else {
				break;
			}
		}

		return currentLevel;
	}, []);

	const getNextLevel = useCallback(
		(currentLevel: number): LevelConfig | null => {
			return (
				LEVEL_CONFIGS.find((config) => config.level === currentLevel + 1) ||
				null
			);
		},
		[],
	);

	const getProgressToNextLevel = useCallback(
		(experience: number, currentLevel: number): number => {
			const nextLevel = getNextLevel(currentLevel);
			if (!nextLevel) return 1; // Max level reached

			const currentLevelConfig = LEVEL_CONFIGS.find(
				(config) => config.level === currentLevel,
			)!;
			const progressRange =
				nextLevel.requiredXP - currentLevelConfig.requiredXP;
			const currentProgress = experience - currentLevelConfig.requiredXP;

			return Math.max(0, Math.min(1, currentProgress / progressRange));
		},
		[getNextLevel],
	);

	const awardPoints = useCallback(
		async (points: number, reason: string) => {
			if (!user || !userStats) return;

			try {
				const oldLevel = calculateLevel(userStats.experience);
				const newExperience = userStats.experience + points;
				const newLevel = calculateLevel(newExperience);

				// Update user stats
				const updatedStats = {
					...userStats,
					experience: newExperience,
					totalPoints: userStats.totalPoints + points,
					level: newLevel.level,
				};

				await DataService.updateUserStats(user.id, updatedStats);
				setUserStats(updatedStats);

				// Animate points gained
				pointsAnimation.setValue(0);
				Animated.spring(pointsAnimation, {
					toValue: 1,
					useNativeDriver: true,
					tension: 100,
					friction: 8,
				}).start();

				// Check for level up
				if (newLevel.level > oldLevel.level) {
					levelUpAnimation.setValue(0);
					Animated.sequence([
						Animated.timing(levelUpAnimation, {
							toValue: 1,
							duration: 500,
							useNativeDriver: true,
						}),
						Animated.delay(2000),
						Animated.timing(levelUpAnimation, {
							toValue: 0,
							duration: 300,
							useNativeDriver: true,
						}),
					]).start();
				}

				return { leveledUp: newLevel.level > oldLevel.level, newLevel };
			} catch (error) {
				console.error("Error awarding points:", error);
				return { leveledUp: false, newLevel: null };
			}
		},
		[user, userStats, pointsAnimation, levelUpAnimation, calculateLevel],
	);

	const unlockAchievement = useCallback(
		async (achievementId: string) => {
			if (!user || !userStats) return;

			try {
				const achievement = await DataService.unlockAchievement(
					user.id,
					achievementId,
				);
				if (achievement) {
					const updatedStats = {
						...userStats,
						achievements: [...userStats.achievements, achievement],
					};
					setUserStats(updatedStats);

					// Animate achievement unlock
					achievementAnimation.setValue(0);
					Animated.sequence([
						Animated.spring(achievementAnimation, {
							toValue: 1,
							useNativeDriver: true,
							tension: 80,
							friction: 6,
						}),
						Animated.delay(3000),
						Animated.timing(achievementAnimation, {
							toValue: 0,
							duration: 400,
							useNativeDriver: true,
						}),
					]).start();

					return achievement;
				}
			} catch (error) {
				console.error("Error unlocking achievement:", error);
			}
			return null;
		},
		[user, userStats, achievementAnimation],
	);

	const updateStreak = useCallback(async () => {
		if (!user || !userStats) return;

		try {
			const today = new Date().toISOString().split("T")[0];
			const lastActive = new Date(userStats.lastActiveDate)
				.toISOString()
				.split("T")[0];
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split("T")[0];

			let newStreak = userStats.streak;

			if (lastActive === yesterdayStr) {
				// Continue streak
				newStreak += 1;
			} else if (lastActive !== today) {
				// Streak broken
				newStreak = 1;
			}

			const updatedStats = {
				...userStats,
				streak: newStreak,
				lastActiveDate: today,
			};

			await DataService.updateUserStats(user.id, updatedStats);
			setUserStats(updatedStats);

			return newStreak;
		} catch (error) {
			console.error("Error updating streak:", error);
			return userStats.streak;
		}
	}, [user, userStats]);

	const checkAchievements = useCallback(async () => {
		if (!userStats) return;

		const checks = [
			// First issue reported
			{
				id: "first_report",
				condition: userStats.issuesReported >= 1,
				points: 50,
			},
			// Active reporter
			{
				id: "active_reporter",
				condition: userStats.issuesReported >= 5,
				points: 100,
			},
			// Community engager
			{
				id: "community_engager",
				condition: userStats.issuesUpvoted >= 10,
				points: 75,
			},
			// Consistent user
			{ id: "consistent_user", condition: userStats.streak >= 7, points: 150 },
			// Veteran user
			{
				id: "veteran_user",
				condition: userStats.issuesReported >= 20,
				points: 300,
			},
		];

		for (const check of checks) {
			if (
				check.condition &&
				!userStats.achievements.some((a) => a.id === check.id)
			) {
				await unlockAchievement(check.id);
				await awardPoints(check.points, `Achievement unlocked: ${check.id}`);
			}
		}
	}, [userStats, unlockAchievement, awardPoints]);

	return {
		userStats,
		loading,
		levelConfigs: LEVEL_CONFIGS,
		calculateLevel,
		getNextLevel,
		getProgressToNextLevel,
		awardPoints,
		unlockAchievement,
		updateStreak,
		checkAchievements,
		loadUserStats,
		animations: {
			points: pointsAnimation,
			levelUp: levelUpAnimation,
			achievement: achievementAnimation,
		},
	};
};
