import * as p from "drizzle-orm/pg-core";
import { experience } from "./experience";
import { relations } from "drizzle-orm";

export const experienceImage = p.pgTable("experience_image", {
	id: p.uuid().primaryKey().defaultRandom(),
	experience_id: p
		.uuid()
		.references(() => experience.id, { onDelete: "cascade" }),
	image_url: p.text().notNull(),
	created_at: p.timestamp().notNull().defaultNow(),
	updated_at: p.timestamp().notNull().defaultNow(),
});

export const experienceImageRelations = relations(experienceImage, ({ one }) => ({
	experience: one(experience, {
		fields: [experienceImage.experience_id],
		references: [experience.id],
	}),
}));