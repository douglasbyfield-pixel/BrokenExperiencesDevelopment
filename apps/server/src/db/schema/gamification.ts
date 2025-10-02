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
	category: text("category").notNull(), // 'reporting', 'community', 'special'
	points: integer("points").notNull(),
	requirement: integer("requirement").notNull(),
	requirementType: text("requirement_type").notNull(), // 'reports_count', 'resolved_count', 'votes_received', etc.
	rarity: text("rarity", { enum: ["common", "rare", "epic", "legendary"] }).default("common"),
	isHidden: boolean("is_hidden").default(false),
	createdAt: timestamp("created_at").defaultNow(),
});

export const userProfile = pgTable("user_profile", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().unique(),
	level: integer("level").default(1),
	totalPoints: integer("total_points").default(0),
	currentLevelPoints: integer("current_level_points").default(0),
	nextLevelPoints: integer("next_level_points").default(100),
	title: text("title").default("Newcomer"),
	streak: integer("streak").default(0),
	lastActiveDate: timestamp("last_active_date"),
	joinedAt: timestamp("joined_at").defaultNow(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserAchievementsSchema = createInsertSchema(userAchievements);
export const selectUserAchievementsSchema = createSelectSchema(userAchievements);
export const insertAchievementsSchema = createInsertSchema(achievements);
export const selectAchievementsSchema = createSelectSchema(achievements);
export const insertUserProfileSchema = createInsertSchema(userProfile);
export const selectUserProfileSchema = createSelectSchema(userProfile);

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;