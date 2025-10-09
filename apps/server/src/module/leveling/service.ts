import { db } from "@server/db";
import type { UserProfile } from "@server/db/schema";
import { LEVELING_CONFIG, userProfile } from "@server/db/schema";
import { eq } from "drizzle-orm";

export class LevelingService {
	/**
	 * Add experience to a user and handle leveling up
	 */
	static async addExperience(userId: string, experiencePoints: number) {
		return await db.transaction(async (tx) => {
			// Get current user level data
			const currentLevelData = await tx.query.userProfile.findFirst({
				where: (profile, { eq }) => eq(profile.auth_user_id, userId),
			});

			if (!currentLevelData) {
				// First time user - create profile record with leveling data
				const newTotalExperience = experiencePoints;
				const newLevel =
					LEVELING_CONFIG.calculateLevelFromExperience(newTotalExperience);
				const experienceToNextLevel =
					LEVELING_CONFIG.calculateExperienceToNextLevel(
						newLevel,
						newTotalExperience,
					);

				await tx.insert(userProfile).values({
					auth_user_id: userId,
					handle: `user_${userId.slice(0, 8)}`, // Generate a default handle
					level: newLevel,
					total_experience: newTotalExperience,
					experience_to_next_level: experienceToNextLevel,
				});

				return {
					level: newLevel,
					totalExperience: newTotalExperience,
					experienceToNextLevel,
					leveledUp: newLevel > 1,
					levelsGained: newLevel - 1,
				};
			}
			// Existing user - add experience and check for level up
			const newTotalExperience =
				currentLevelData.total_experience + experiencePoints;
			const newLevel =
				LEVELING_CONFIG.calculateLevelFromExperience(newTotalExperience);
			const experienceToNextLevel =
				LEVELING_CONFIG.calculateExperienceToNextLevel(
					newLevel,
					newTotalExperience,
				);

			const leveledUp = newLevel > currentLevelData.level;
			const levelsGained = newLevel - currentLevelData.level;

			await tx
				.update(userProfile)
				.set({
					level: newLevel,
					total_experience: newTotalExperience,
					experience_to_next_level: experienceToNextLevel,
					updated_at: new Date(),
				})
				.where(eq(userProfile.auth_user_id, userId));

			return {
				level: newLevel,
				totalExperience: newTotalExperience,
				experienceToNextLevel,
				leveledUp,
				levelsGained,
			};
		});
	}

	/**
	 * Get user level information
	 */
	static async getUserLevel(userId: string): Promise<UserProfile | null> {
		const result = await db.query.userProfile.findFirst({
			where: (profile, { eq }) => eq(profile.auth_user_id, userId),
		});
		return result ?? null;
	}

	/**
	 * Get level information for a specific level
	 */
	static getLevelInfo(level: number) {
		const totalExperienceRequired =
			LEVELING_CONFIG.calculateTotalExperienceForLevel(level);
		const experienceForThisLevel =
			LEVELING_CONFIG.calculateExperienceForLevel(level);
		const experienceForNextLevel = LEVELING_CONFIG.calculateExperienceForLevel(
			level + 1,
		);

		return {
			level,
			totalExperienceRequired,
			experienceForThisLevel,
			experienceForNextLevel,
			isMaxLevel: level >= LEVELING_CONFIG.MAX_LEVEL,
		};
	}

	/**
	 * Get experience progress for a user
	 */
	static async getUserProgress(userId: string) {
		const userLevelData = await LevelingService.getUserLevel(userId);

		if (!userLevelData) {
			return {
				level: 1,
				totalExperience: 0,
				experienceToNextLevel: LEVELING_CONFIG.calculateExperienceForLevel(2),
				progressPercentage: 0,
				isMaxLevel: false,
			};
		}

		const currentLevelInfo = LevelingService.getLevelInfo(userLevelData.level);
		const nextLevelInfo = LevelingService.getLevelInfo(userLevelData.level + 1);

		const experienceInCurrentLevel =
			userLevelData.total_experience - currentLevelInfo.totalExperienceRequired;
		const experienceNeededForNextLevel = nextLevelInfo.experienceForNextLevel;
		const progressPercentage = Math.floor(
			(experienceInCurrentLevel / experienceNeededForNextLevel) * 100,
		);

		return {
			level: userLevelData.level,
			totalExperience: userLevelData.total_experience,
			experienceToNextLevel: userLevelData.experience_to_next_level,
			progressPercentage,
			isMaxLevel: userLevelData.level >= LEVELING_CONFIG.MAX_LEVEL,
		};
	}

	/**
	 * Get leaderboard data with levels
	 */
	static async getLevelLeaderboard(limit = 100) {
		return await db
			.select({
				userId: userProfile.auth_user_id,
				level: userProfile.level,
				totalExperience: userProfile.total_experience,
			})
			.from(userProfile)
			.orderBy(userProfile.level, userProfile.total_experience)
			.limit(limit);
	}
}
