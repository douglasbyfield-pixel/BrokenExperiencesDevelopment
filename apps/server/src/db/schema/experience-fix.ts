import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";
import { experience } from "./experience";
import { experienceImage } from "./experience-image";

// Experience fix table - combines claim and resolution into one atomic action
export const experienceFix = p.pgTable(
	"experience_fix",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		
		// References
		experienceId: p
			.uuid()
			.references(() => experience.id, { onDelete: "cascade" })
			.notNull(),
		claimedBy: p
			.text()
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		
		// Claim status and timing
		status: p
			.varchar()
			.notNull()
			.$type<"claimed" | "in_progress" | "completed" | "abandoned">()
			.default("claimed"),

        /** When they claimed the experience */
		claimedAt: p.timestamp().notNull().defaultNow(),

        /** When they started working on it */
		startedAt: p.timestamp(), // When they started working on it

        /** When they finished and uploaded proof */
		completedAt: p.timestamp(), // When they finished and uploaded proof
		
		// Optional notes
		claimNotes: p.text(), // Notes when claiming
		fixNotes: p.text(), // Notes about the actual fix
		
		// Timestamps
		createdAt: p.timestamp().notNull().defaultNow(),
		updatedAt: p.timestamp().notNull().defaultNow(),
	},
	(table) => ({
		experienceIdIdx: p.index("idx_experience_fix_experience_id").on(table.experienceId),
		claimedByIdx: p.index("idx_experience_fix_claimed_by").on(table.claimedBy),
		statusIdx: p.index("idx_experience_fix_status").on(table.status),
		claimedAtIdx: p.index("idx_experience_fix_claimed_at").on(table.claimedAt),
		createdAtIdx: p.index("idx_experience_fix_created_at").on(table.createdAt),
		// Unique constraint to prevent duplicate claims by the same user for the same experience
		uniqueUserExperience: p.unique("unique_user_experience_fix").on(table.experienceId, table.claimedBy),
	}),
);

export const experienceFixRelations = relations(experienceFix, ({ one, many }) => ({
	experience: one(experience, {
		fields: [experienceFix.experienceId],
		references: [experience.id],
	}),
	claimedBy: one(user, {
		fields: [experienceFix.claimedBy],
		references: [user.id],
	}),
	images: many(experienceImage),
}));

// Type exports
export type ExperienceFix = typeof experienceFix.$inferSelect;
export type NewExperienceFix = typeof experienceFix.$inferInsert;
