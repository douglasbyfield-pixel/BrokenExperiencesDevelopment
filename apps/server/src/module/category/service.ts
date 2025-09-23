import { db } from "@/db";
import type { CategoryCreate, CategoryQuery, CategoryUpdate } from "./schema";
import { category } from "@/db/schema";

export const getCategories = async (options: { query: CategoryQuery }) => {
	const page = options.query.page ?? 1;
	const limit = options.query.limit ?? 10;
	const offset = (page - 1) * limit;

	const categories = await db
		.select()
		.from(category)
		.limit(limit)
		.offset(offset);

	return categories ?? [];
};

export const createCategory = async (options: { data: CategoryCreate }) => {
	const { data } = options;
	const createdCategory = await db.insert(category).values(data).returning();

	return createdCategory;
};

export const getCategory = async (options: { id: string }) => {
	const { id } = options;
	const getCategory = await db.query.category.findFirst({
		where: (category, { eq }) => eq(category.id, id),
	});
	return getCategory;
};

export const updateCategory = async (options?: { id: string, data: CategoryUpdate }) => {
	return options?.id;
};

export const deleteCategory = async (options?: { id: string }) => {
	return options?.id;
};