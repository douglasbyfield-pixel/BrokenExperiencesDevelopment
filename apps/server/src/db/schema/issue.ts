import { pgTable, text, timestamp, numeric, pgEnum, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const issueStatusEnum = pgEnum("issue_status", ["reported", "pending", "resolved"]);
export const issueSeverityEnum = pgEnum("issue_severity", ["low", "medium", "high", "critical"]);

export const issue = pgTable("issue", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
	longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
	address: text("address"),
	status: issueStatusEnum("status").notNull().default("reported"),
	severity: issueSeverityEnum("severity").notNull().default("medium"),
	reporterId: text("reporter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	assigneeId: text("assignee_id")
		.references(() => user.id, { onDelete: "set null" }),
	categoryId: text("category_id"),
	imageUrls: text("image_urls").array(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	resolvedAt: timestamp("resolved_at"),
	upvotes: integer("upvotes").notNull().default(0),
	downvotes: integer("downvotes").notNull().default(0),
});