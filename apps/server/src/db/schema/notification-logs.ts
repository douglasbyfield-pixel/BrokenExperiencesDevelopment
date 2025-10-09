import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { experience } from "./experience";

export const notificationLogs = p.pgTable(
	"notification_logs",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		type: p.text().notNull(),
		experienceId: p.uuid("experience_id").references(() => experience.id, { onDelete: "set null" }),
		recipientsCount: p.integer("recipients_count").default(0),
		proximityRadius: p.decimal("proximity_radius", { precision: 10, scale: 2 }),
		successCount: p.integer("success_count").default(0),
		failureCount: p.integer("failure_count").default(0),
		createdAt: p.timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => ({
		typeIdx: p.index("idx_notification_logs_type").on(table.type),
		experienceIdIdx: p.index("idx_notification_logs_experience_id").on(table.experienceId),
		createdAtIdx: p.index("idx_notification_logs_created_at").on(table.createdAt),
	}),
);

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
	experience: one(experience, {
		fields: [notificationLogs.experienceId],
		references: [experience.id],
	}),
}));

// Type exports
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type NewNotificationLog = typeof notificationLogs.$inferInsert;
