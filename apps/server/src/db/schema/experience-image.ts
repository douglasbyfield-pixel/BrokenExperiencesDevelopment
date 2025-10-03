import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { experience } from "./experience";

export const experienceImage = p.pgTable("experience_image", {
	id: p.uuid().primaryKey().defaultRandom(),
	experienceId: p
		.uuid()
		.references(() => experience.id, { onDelete: "cascade" }),
	imageUrl: p.text().notNull(),
	createdAt: p.timestamp().notNull().defaultNow(),
	updatedAt: p.timestamp().notNull().defaultNow(),
}, (table) => ({
	experienceIdIdx: p.index("idx_experience_image_experience_id").on(table.experienceId),
}));

export const experienceImageRelations = relations(
	experienceImage,
	({ one }) => ({
		experience: one(experience, {
			fields: [experienceImage.experienceId],
			references: [experience.id],
		}),
	}),
);
