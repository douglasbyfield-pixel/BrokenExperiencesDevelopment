import * as p from "drizzle-orm/pg-core";

// Role for onboarding – reporter by default
export const userRoleEnum = p.pgEnum("user_role", ["reporter", "organiser"]);

export const userProfile = p.pgTable(
	"user_profile",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		// Supabase auth user id (uuid as text) or any external auth identifier
		auth_user_id: p.text().notNull(),

		handle: p.varchar({ length: 64 }).notNull(),
		display_name: p.varchar({ length: 120 }),
		bio: p.text(),
		avatar_url: p.text(),

		role: userRoleEnum("role").notNull().default("reporter"),

		// Gamification fields
		level: p.integer("level").notNull().default(1),
		total_experience: p.integer("total_experience").notNull().default(0),
		experience_to_next_level: p
			.integer("experience_to_next_level")
			.notNull()
			.default(100),

		created_at: p.timestamp().notNull().defaultNow(),
		updated_at: p.timestamp().notNull().defaultNow(),
	},
	(t) => ({
		handleUniqueIdx: p.uniqueIndex("user_profile_handle_unique").on(t.handle),
		authUserUniqueIdx: p
			.uniqueIndex("user_profile_auth_user_id_unique")
			.on(t.auth_user_id),
	}),
);

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;
