import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";
import { experience } from "./experience";

// Experience verifications table - community endorsements
export const experienceVerification = p.pgTable(
	"experience_verification",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		
		// References
		experienceId: p
			.uuid()
			.references(() => experience.id, { onDelete: "cascade" })
			.notNull(),
		verifiedBy: p
			.text()
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		
		/** Verification details - Waze-like crowdsourced feedback */
		verificationType: p
			.varchar()
			.notNull()
			.$type<"proximity" | "creator_confirmation">(),

        /** Whether the issue is still there or resolved */
		verificationStatus: p
			.varchar()
			.notNull()
			.$type<"issue_still_there" | "issue_resolved" | "pending">()
			.default("pending"),
		
		/** Location where verification was performed */
		verificationLatitude: p.decimal(),
		verificationLongitude: p.decimal(),
		distanceFromExperience: p.decimal(), // Distance in meters from the experience location
		
		// Verification notes
		verificationNotes: p.text(),
		
		// Timestamps
		createdAt: p.timestamp().notNull().defaultNow(),
		updatedAt: p.timestamp().notNull().defaultNow(),
	},
	(table) => ({
		experienceIdIdx: p.index("idx_experience_verification_experience_id").on(table.experienceId),
		verifiedByIdx: p.index("idx_experience_verification_verified_by").on(table.verifiedBy),
		verificationTypeIdx: p.index("idx_experience_verification_type").on(table.verificationType),
		verificationStatusIdx: p.index("idx_experience_verification_status").on(table.verificationStatus),
		createdAtIdx: p.index("idx_experience_verification_created_at").on(table.createdAt),
	}),
);

export const experienceVerificationRelations = relations(experienceVerification, ({ one }) => ({
	experience: one(experience, {
		fields: [experienceVerification.experienceId],
		references: [experience.id],
	}),
	verifiedBy: one(user, {
		fields: [experienceVerification.verifiedBy],
		references: [user.id],
	}),
}));

// Type exports
export type ExperienceVerification = typeof experienceVerification.$inferSelect;
export type NewExperienceVerification = typeof experienceVerification.$inferInsert;
