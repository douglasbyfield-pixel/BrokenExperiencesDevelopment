import { createInsertSchema } from "drizzle-typebox";
import Elysia, { type Static, t } from "elysia";
import { category } from "../../db/schema/category";

const baseCategoryInsertSchema = createInsertSchema(category);

export const categoryCreateSchema = t.Object({
	name: baseCategoryInsertSchema.properties.name,
});

export const categoryUpdateSchema = t.Object({
	name: baseCategoryInsertSchema.properties.name,
});

export type CategoryCreate = Static<typeof categoryCreateSchema>;
export type CategoryUpdate = Static<typeof categoryUpdateSchema>;

export const categoryModel = new Elysia().model({
	"category.create": categoryCreateSchema,
	"category.update": categoryUpdateSchema,
});
