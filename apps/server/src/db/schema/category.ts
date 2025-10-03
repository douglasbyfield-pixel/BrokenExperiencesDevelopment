import * as p from "drizzle-orm/pg-core";

export const category = p.pgTable("category", {
	id: p.uuid().primaryKey().defaultRandom(),
	name: p.varchar().notNull(),
	createdAt: p.timestamp().notNull().defaultNow(),
	updatedAt: p.timestamp().notNull().defaultNow(),
}, (table) => ({
	categoryIdIdx: p.index("idx_category_id").on(table.id),
}));
