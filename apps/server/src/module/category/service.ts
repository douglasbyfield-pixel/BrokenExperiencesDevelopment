import type { CategoryCreate } from "./schema";

export const getCategories = (options?: {}) => {
	return "hello world";
};

export const createCategory = async (options?: { data: CategoryCreate }) => {
	return options?.data;
};
