import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";

export const experience = p.pgTable("experience", {
	id: p.uuid().primaryKey().defaultRandom(),
	reported_by: p.uuid().references(() => user.id),
	title: p.text().notNull(),
	description: p.text().notNull(),
	latitude: p.decimal().notNull(),
	longitude: p.decimal().notNull(),
	address: p.text().notNull(),
	category: p.varchar().notNull(),
	status: p.varchar().notNull().default("pending"),
	priority: p.varchar().notNull().default("medium"),
	created_at: p.timestamp().notNull().defaultNow(),
	updated_at: p.timestamp().notNull().defaultNow(),
});
