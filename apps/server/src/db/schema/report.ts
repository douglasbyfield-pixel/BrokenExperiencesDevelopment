import { pgTable, uuid, text, varchar, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const ReportStatusEnum = {
	pending: "pending",
	under_review: "under_review",
	resolved: "resolved",
	rejected: "rejected",
} as const;

export const ReportPriorityEnum = {
	low: "low",
	medium: "medium",
	high: "high",
	urgent: "urgent",
} as const;

export const report = pgTable("report", {
	id: uuid().primaryKey().defaultRandom(),
	reportedBy: uuid().references(() => user.id, { onDelete: "cascade" }),
	
	// Content data from experience form
	description: text().notNull(),
	categories: jsonb().notNull().default([]), // JSONB array of category objects
	
	// Location data
	latitude: numeric(),
	longitude: numeric(),
	
	// Report management
	status: varchar()
		.notNull()
		.$type<keyof typeof ReportStatusEnum>()
		.default(ReportStatusEnum.pending),
	priority: varchar()
		.notNull()
		.$type<keyof typeof ReportPriorityEnum>()
		.default(ReportPriorityEnum.medium),
	
	// Timestamps
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
	resolvedAt: timestamp(),
	
	// Engagement metrics
	upvotes: integer().notNull().default(0),
	downvotes: integer().notNull().default(0),
});


export const reportImage = pgTable("report_image", {
	id: uuid().primaryKey().defaultRandom(),
	reportId: uuid()
		.references(() => report.id, { onDelete: "cascade" }),
	imageUrl: text().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const reportImageRelations = relations(reportImage, ({ one }) => ({
	report: one(report, {
		fields: [reportImage.reportId],
		references: [report.id],
	}),
}));



export const reportRelations = relations(report, ({ one, many }) => ({
	reportedBy: one(user, {
		fields: [report.reportedBy],
		references: [user.id],
	}),
	reportImages: many(reportImage),
}));

