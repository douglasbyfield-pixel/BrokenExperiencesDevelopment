import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";
import { experience } from "./experience";

export const vote = p.pgTable("vote", {
	id: p.uuid().primaryKey().defaultRandom(),
	experience_id: p.uuid().references(() => experience.id, { onDelete: "cascade" }),
	user_id: p.uuid().references(() => user.id, { onDelete: "cascade" }),
	vote: p.boolean().notNull(),
	created_at: p.timestamp().notNull().defaultNow(),
});