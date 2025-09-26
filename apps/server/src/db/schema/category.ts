import * as p from "drizzle-orm/pg-core";

export const category = p.pgTable("category", {
	id: p.uuid().primaryKey().defaultRandom(),
	name: p.varchar().notNull(),
	created_at: p.timestamp().notNull().defaultNow(),
	updated_at: p.timestamp().notNull().defaultNow(),
});
