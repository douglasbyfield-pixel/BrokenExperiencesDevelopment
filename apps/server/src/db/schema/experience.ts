import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import type { ExperiencePriority, ExperienceStatus } from "../../types";
import { user } from "./auth";
import { category } from "./category";
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
	reportedBy: p
		.uuid()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	categoryId: p
		.uuid()
		.references(() => category.id, { onDelete: "cascade" })
		.notNull(),
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
	createdAt: p.timestamp().notNull().defaultNow(),
	resolvedAt: p.timestamp(),
	updatedAt: p.timestamp().notNull().defaultNow(),
	upvotes: p.integer().notNull().default(0),
	downvotes: p.integer().notNull().default(0),
});

export const experienceRelations = relations(experience, ({ one, many }) => ({
	reportedBy: one(user, {
		fields: [experience.reportedBy],
		references: [user.id],
	}),
	category: one(category, {
		fields: [experience.categoryId],
		references: [category.id],
	}),
	experienceImages: many(experienceImage),
}));
