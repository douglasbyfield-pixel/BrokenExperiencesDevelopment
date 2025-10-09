import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { experience } from "./experience";
import { experienceFix } from "./experience-fix";
import { user } from "./auth";

export const experienceImage = p.pgTable(
	"experience_image",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		experienceId: p
			.uuid()
			.references(() => experience.id, { onDelete: "cascade" }),
		imageUrl: p.text().notNull(),
		
		// New fields for fix image support (with safe defaults)
		imageDescription: p.text(), // Optional description
		uploadedBy: p
			.text()
			.references(() => user.id, { onDelete: "cascade" }), // Optional - can be null for existing records
		experienceFixId: p
			.uuid()
			.references(() => experienceFix.id, { onDelete: "cascade" }), // Optional - only for fix images
		
		createdAt: p.timestamp().notNull().defaultNow(),
		updatedAt: p.timestamp().notNull().defaultNow(),
	},
	(table) => ({
		experienceIdIdx: p
			.index("idx_experience_image_experience_id")
			.on(table.experienceId),
		uploadedByIdx: p.index("idx_experience_image_uploaded_by").on(table.uploadedBy),
		experienceFixIdIdx: p.index("idx_experience_image_experience_fix_id").on(table.experienceFixId),
	}),
);

export const experienceImageRelations = relations(
	experienceImage,
	({ one }) => ({
		experience: one(experience, {
			fields: [experienceImage.experienceId],
			references: [experience.id],
		}),
		uploadedBy: one(user, {
			fields: [experienceImage.uploadedBy],
			references: [user.id],
		}),
		experienceFix: one(experienceFix, {
			fields: [experienceImage.experienceFixId],
			references: [experienceFix.id],
		}),
	}),
);
