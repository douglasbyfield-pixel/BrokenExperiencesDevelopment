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

export const experience = p.pgTable(
	"experience",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		reportedBy: p
			.text()
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
	},
	(table) => ({
		// Performance indexes
		categoryIdIdx: p.index("idx_experience_category_id").on(table.categoryId),
		reportedByIdx: p.index("idx_experience_reported_by").on(table.reportedBy),
		statusIdx: p.index("idx_experience_status").on(table.status),
		priorityIdx: p.index("idx_experience_priority").on(table.priority),
		createdAtIdx: p.index("idx_experience_created_at").on(table.createdAt),
		// Location indexes for spatial queries
		latitudeIdx: p.index("idx_experience_latitude").on(table.latitude),
		longitudeIdx: p.index("idx_experience_longitude").on(table.longitude),
		// Composite location index for spatial queries
		locationIdx: p
			.index("idx_experience_location")
			.on(table.latitude, table.longitude),
	}),
);

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
