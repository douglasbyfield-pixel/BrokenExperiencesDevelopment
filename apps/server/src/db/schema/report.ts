import { pgTable, uuid, text, varchar, timestamp, integer, numeric, jsonb, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";


export const ReportPriorityEnum = {
	low: "low",
	medium: "medium",
	high: "high",
	urgent: "urgent",
} as const;

export const report = pgTable("report", {
	/** Unique identifier for the report */
	id: uuid().primaryKey().defaultRandom(),
	
	/** User who submitted the report */
	reportedBy: text().references(() => user.id, { onDelete: "cascade" }),
	
	/** Detailed description of the broken experience */
	description: text().notNull(),
	
	/** Array of category strings selected by the user */
	categories: jsonb().notNull().default([]),
	
	// Location data
	/** GPS latitude coordinate of the report location */
	latitude: numeric(),
	
	/** GPS longitude coordinate of the report location */
	longitude: numeric(),
	
	/** Priority level of the report (low, medium, high, urgent) */
	priority: varchar()
		.notNull()
		.$type<keyof typeof ReportPriorityEnum>()
		.default(ReportPriorityEnum.medium),
	
	/** When the report was created */
	createdAt: timestamp().notNull().defaultNow(),
	
	/** When the report was last updated */
	updatedAt: timestamp().notNull().defaultNow(),
	
	/** When the report was resolved (if applicable) */
	resolvedAt: timestamp(),
	
	/** Number of upvotes the report has received */
	upvotes: integer().notNull().default(0),
	
	/** Number of downvotes the report has received */
	downvotes: integer().notNull().default(0),
	
	// Visibility scope
	/** Radius in meters where unverified reports are visible (default: 5000m) */
	visibilityRadius: numeric().default("5000"),
});


export const reportImage = pgTable("report_image", {
	/** Unique identifier for the image */
	id: uuid().primaryKey().defaultRandom(),
	
	/** ID of the report this image belongs to */
	reportId: uuid()
		.references(() => report.id, { onDelete: "cascade" }),
	
	/** URL or path to the image file */
	imageUrl: text().notNull(),
	
	/** When the image was uploaded */
	createdAt: timestamp().notNull().defaultNow(),
	
	/** When the image was last updated */
	updatedAt: timestamp().notNull().defaultNow(),
});

/**
 * Verification attempts table - tracks users who have attempted to verify reports
 * A report is considered verified when it has at least one "confirmed" verification
 */
export const reportVerification = pgTable("report_verification", {
	/** Unique identifier for the verification attempt */
	id: uuid().primaryKey().defaultRandom(),
	
	/** ID of the report being verified */
	reportId: uuid()
		.references(() => report.id, { onDelete: "cascade" }),
	
	/** User who attempted the verification */
	verifiedBy: text().references(() => user.id, { onDelete: "cascade" }),
	
	/** Status of the verification (verified, rejected, pending) */
	verificationStatus: varchar().notNull().$type<"verified" | "rejected" | "pending">().default("pending"),
	
	/** Optional notes from the verifier about the verification */
	verificationNotes: text(),
	
	/** GPS latitude where verification was attempted */
	verificationLatitude: numeric(),
	
	/** GPS longitude where verification was attempted */
	verificationLongitude: numeric(),
	
	/** When the verification attempt was created */
	createdAt: timestamp().notNull().defaultNow(),
	
	/** When the verification was last updated */
	updatedAt: timestamp().notNull().defaultNow(),
});

export const reportImageRelations = relations(reportImage, ({ one }) => ({
	report: one(report, {
		fields: [reportImage.reportId],
		references: [report.id],
	}),
}));

export const reportVerificationRelations = relations(reportVerification, ({ one }) => ({
	report: one(report, {
		fields: [reportVerification.reportId],
		references: [report.id],
	}),
	verifiedBy: one(user, {
		fields: [reportVerification.verifiedBy],
		references: [user.id],
	}),
}));



export const reportRelations = relations(report, ({ one, many }) => ({
	reportedBy: one(user, {
		fields: [report.reportedBy],
		references: [user.id],
	}),
	reportImages: many(reportImage),
	verifications: many(reportVerification),
}));

