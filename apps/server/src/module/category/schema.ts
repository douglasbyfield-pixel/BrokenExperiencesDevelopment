import { category } from "@server/db/schema";
import { createInsertSchema } from "drizzle-typebox";
import Elysia, { type Static, t } from "elysia";

const baseCategoryInsertSchema = createInsertSchema(category);

const categoryQuerySchema = t.Optional(
	t.Object({
		limit: t.Number({ default: 10 }),
		offset: t.Number({ default: 0 }),
		query: t.Optional(t.String({ default: undefined })),
		page: t.Optional(t.Number({ default: 1 })),
	}),
);

const categoryCreateSchema = t.Object({
	name: baseCategoryInsertSchema.properties.name,
});

const categoryUpdateSchema = t.Partial(categoryCreateSchema);

export type CategoryCreate = Static<typeof categoryCreateSchema>;
export type CategoryUpdate = Static<typeof categoryUpdateSchema>;
export type CategoryQuery = Static<typeof categoryQuerySchema>;

export const categoryModel = new Elysia().model({
	"category.identifier.params": t.Object({
		categoryId: t.String({ format: "uuid" }),
	}),
	"category.create": categoryCreateSchema,
	"category.update": categoryUpdateSchema,
	"category.query": categoryQuerySchema,
});
