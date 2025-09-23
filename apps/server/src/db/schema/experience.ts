import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";
import { category } from "./category";
import type { ExperienceStatus } from "@/types";
import type { ExperiencePriority } from "@/types";
import { relations } from "drizzle-orm";
import { experienceImage } from "./experience-image";

export const ExperienceStatusEnum = {
	pending: "pending",
	resolved: "resolved",
	in_progress: "in_progress",
} as const;

export const ExperiencePriorityEnum = {
	low: "low",
	medium: "medium",
	high: "high",
	critical: "critical",
} as const;

export const experience = p.pgTable("experience", {
	id: p.uuid().primaryKey().defaultRandom(),
	reported_by: p.uuid().references(() => user.id, { onDelete: "cascade" }),
	category_id: p.uuid().references(() => category.id, { onDelete: "cascade" }),
	title: p.text().notNull(),
	description: p.text().notNull(),
	latitude: p.decimal().notNull(),
	longitude: p.decimal().notNull(),
	address: p.text().notNull(),
	status: p
		.varchar()
		.notNull()
		.$type<ExperienceStatus>()
		.default(ExperienceStatusEnum.pending),
	priority: p
		.varchar()
		.notNull()
		.$type<ExperiencePriority>()
		.default(ExperiencePriorityEnum.medium),
	created_at: p.timestamp().notNull().defaultNow(),
	resolved_at: p.timestamp(),
	updated_at: p.timestamp().notNull().defaultNow(),
	upvotes: p.integer().notNull().default(0),
	downvotes: p.integer().notNull().default(0),
});

export const experienceRelations = relations(experience, ({ one ,many}) => ({
	reported_by: one(user, {
		fields: [experience.reported_by],
		references: [user.id],
	}),
	category: one(category, {
		fields: [experience.category_id],
		references: [category.id],
	}),
	experience_images: many(experienceImage),
}));
