import { db } from "@server/db";
import { achievements, userAchievements } from "@server/db/schema";
import { eq } from "drizzle-orm";

export interface BadgeWithStatus {
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
	createdAt: Date;
	// User-specific status
	isObtained: boolean;
	progress: number;
	maxProgress: number;
	isCompleted: boolean;
	unlockedAt: Date | null;
}

export class BadgesService {
	/**
	 * Get all badges with user's achievement status
	 */
	static async getBadgesWithUserStatus(userId: string): Promise<BadgeWithStatus[]> {
		// Get all achievements
		const allAchievements = await db.query.achievements.findMany({
			orderBy: (achievements, { asc }) => [
				asc(achievements.category),
				asc(achievements.requirement),
			],
		});

		// Get user's achievements
		const userAchievementsList = await db.query.userAchievements.findMany({
			where: (userAchievements, { eq }) => eq(userAchievements.userId, userId),
		});

		// Create a map of user achievements for quick lookup
		const userAchievementsMap = new Map(
			userAchievementsList.map(ua => [ua.achievementId, ua])
		);

		// Combine achievements with user status
		return allAchievements.map(achievement => {
			const userAchievement = userAchievementsMap.get(achievement.id);
			
			return {
				id: achievement.id,
				name: achievement.name,
				description: achievement.description,
				icon: achievement.icon,
				category: achievement.category,
				points: achievement.points,
				requirement: achievement.requirement,
				requirementType: achievement.requirementType,
				rarity: achievement.rarity,
				isHidden: achievement.isHidden,
				createdAt: achievement.createdAt,
				// User-specific status
				isObtained: !!userAchievement,
				progress: userAchievement?.progress || 0,
				maxProgress: userAchievement?.maxProgress || achievement.requirement,
				isCompleted: userAchievement?.isCompleted || false,
				unlockedAt: userAchievement?.unlockedAt || null,
			};
		});
	}


	/**
	 * Get user's obtained badges only
	 */
	static async getUserObtainedBadges(userId: string): Promise<BadgeWithStatus[]> {
		const allBadges = await this.getBadgesWithUserStatus(userId);
		return allBadges.filter(badge => badge.isObtained);
	}

}
