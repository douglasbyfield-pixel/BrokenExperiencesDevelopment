import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";

export const pushSubscriptions = p.pgTable(
	"push_subscriptions",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		userId: p.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
		endpoint: p.text().notNull(),
		p256Dh: p.text().notNull(),
		auth: p.text().notNull(),
		createdAt: p.timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: p.timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => ({
		userIdIdx: p.index("idx_push_subscriptions_user_id").on(table.userId),
		endpointIdx: p.index("idx_push_subscriptions_endpoint").on(table.endpoint),
		userEndpointUnique: p.unique("push_subscriptions_user_id_endpoint_key").on(table.userId, table.endpoint),
	}),
);

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
	user: one(user, {
		fields: [pushSubscriptions.userId],
		references: [user.id],
	}),
}));

// Type exports
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
