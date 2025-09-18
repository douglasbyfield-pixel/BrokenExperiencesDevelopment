import type { CategoryCreate, CategoryUpdate } from "./schema";

export const getCategories = (options?: {}) => {
	return "hello world";
};

export const createCategory = async (options?: { data: CategoryCreate }) => {
	return options?.data;
};

export const getCategory = async (options?: { id: string }) => {
	return options?.id;
};

export const updateCategory = async (options?: { id: string, data: CategoryUpdate }) => {
	return options?.id;
};

export const deleteCategory = async (options?: { id: string }) => {
	return options?.id;
};