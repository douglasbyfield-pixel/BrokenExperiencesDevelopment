import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userAchievements = pgTable("user_achievements", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull(),
	achievementId: text("achievement_id").notNull(),
	unlockedAt: timestamp("unlocked_at").defaultNow(),
	progress: integer("progress").default(0),
	maxProgress: integer("max_progress").default(1),
	isCompleted: boolean("is_completed").default(false),
});

export const achievements = pgTable("achievements", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	icon: text("icon").notNull(),
	category: text("category").notNull(), // 'fixer', 'reporter', 'sponsor', 'community'
	points: integer("points").notNull(),
	requirement: integer("requirement").notNull(),
	requirementType: text("requirement_type").notNull(), // 'fixes_count', 'reports_count', 'sponsorships_count', 'community_actions'
	rarity: text("rarity", { enum: ["common", "rare", "epic", "legendary"] }).default("common"),
	isHidden: boolean("is_hidden").default(false),
	createdAt: timestamp("created_at").defaultNow(),
});


export const activityPoints = pgTable("activity_points", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().unique(),
	experiencesAdded: integer("experiences_added").default(0),
	experiencesFixed: integer("experiences_fixed").default(0),
	experiencesVerified: integer("experiences_verified").default(0),
	experiencesSponsored: integer("experiences_sponsored").default(0),
	totalPoints: integer("total_points").default(0),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity point values
export const ACTIVITY_POINTS = {
	ADD_EXPERIENCE: 10,
	FIX_EXPERIENCE: 20,
	VERIFY_EXPERIENCE: 15,
	SPONSOR_EXPERIENCE: 30,
} as const;

// Leveling system configuration
export const LEVELING_CONFIG = {
	// Base experience required for level 2
	BASE_EXPERIENCE: 100,
	// Experience multiplier per level (exponential growth)
	EXPERIENCE_MULTIPLIER: 1.2,
	// Maximum level
	MAX_LEVEL: 100,
	// Calculate experience required for a specific level
	calculateExperienceForLevel: (level: number): number => {
		if (level <= 1) return 0;
		return Math.floor(LEVELING_CONFIG.BASE_EXPERIENCE * Math.pow(LEVELING_CONFIG.EXPERIENCE_MULTIPLIER, level - 2));
	},
	// Calculate total experience required to reach a level
	calculateTotalExperienceForLevel: (level: number): number => {
		let total = 0;
		for (let i = 2; i <= level; i++) {
			total += LEVELING_CONFIG.calculateExperienceForLevel(i);
		}
		return total;
	},
	// Calculate level from total experience
	calculateLevelFromExperience: (totalExperience: number): number => {
		let level = 1;
		let requiredExp = 0;
		
		while (level < LEVELING_CONFIG.MAX_LEVEL) {
			const expForNextLevel = LEVELING_CONFIG.calculateExperienceForLevel(level + 1);
			if (totalExperience < requiredExp + expForNextLevel) {
				break;
			}
			requiredExp += expForNextLevel;
			level++;
		}
		
		return level;
	},
	// Calculate experience needed for next level
	calculateExperienceToNextLevel: (currentLevel: number, totalExperience: number): number => {
		const expForCurrentLevel = LEVELING_CONFIG.calculateTotalExperienceForLevel(currentLevel);
		const expForNextLevel = LEVELING_CONFIG.calculateTotalExperienceForLevel(currentLevel + 1);
		return expForNextLevel - totalExperience;
	}
} as const;

// Zod schemas for validation
export const insertUserAchievementsSchema = createInsertSchema(userAchievements);
export const selectUserAchievementsSchema = createSelectSchema(userAchievements);
export const insertAchievementsSchema = createInsertSchema(achievements);
export const selectAchievementsSchema = createSelectSchema(achievements);
export const insertActivityPointsSchema = createInsertSchema(activityPoints);
export const selectActivityPointsSchema = createSelectSchema(activityPoints);

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type ActivityPoint = typeof activityPoints.$inferSelect;
export type NewActivityPoint = typeof activityPoints.$inferInsert;