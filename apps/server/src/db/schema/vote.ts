import * as p from "drizzle-orm/pg-core";
import { user } from "./auth";
import { experience } from "./experience";

export const vote = p.pgTable(
	"vote",
	{
		id: p.uuid().primaryKey().defaultRandom(),
		experienceId: p
			.uuid()
			.references(() => experience.id, { onDelete: "cascade" }),
		userId: p.text().references(() => user.id, { onDelete: "cascade" }),
		vote: p.boolean().notNull(),
		createdAt: p.timestamp().notNull().defaultNow(),
	},
	(table) => ({
		experienceIdIdx: p.index("idx_vote_experience_id").on(table.experienceId),
		userIdIdx: p.index("idx_vote_user_id").on(table.userId),
	}),
);
