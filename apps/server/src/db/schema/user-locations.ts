import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userLocations = p.pgTable(
	"user_locations",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		userId: p.text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
		latitude: p.decimal({ precision: 10, scale: 8 }).notNull(),
		longitude: p.decimal({ precision: 11, scale: 8 }).notNull(),
		address: p.text(),
		accuracy: p.decimal({ precision: 10, scale: 2 }),
		lastUpdated: p.timestamp("last_updated", { withTimezone: true }).defaultNow(),
		createdAt: p.timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => ({
		userIdIdx: p.index("idx_user_locations_user_id").on(table.userId),
		coordinatesIdx: p.index("idx_user_locations_coordinates").on(table.latitude, table.longitude),
		lastUpdatedIdx: p.index("idx_user_locations_last_updated").on(table.lastUpdated),
	}),
);

export const userLocationsRelations = relations(userLocations, ({ one }) => ({
	user: one(user, {
		fields: [userLocations.userId],
		references: [user.id],
	}),
}));

// Type exports
export type UserLocation = typeof userLocations.$inferSelect;
export type NewUserLocation = typeof userLocations.$inferInsert;
