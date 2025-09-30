import Elysia from "elysia";
import { categoryModel } from "./schema";
import {
	createCategory,
	deleteCategory,
	getCategories,
	getCategory,
	getCategoryOptions,
	updateCategory,
} from "./service";

export const categoryRouter = new Elysia({
	prefix: "/category",
	tags: ["Category"],
})
	.use(categoryModel)
	.get(
		"/",
		async ({ query }) => {
			try {
				const results = await getCategories({ query: query });
				return results;
			} catch (error) {
				console.log(error);
				return {
					status: 500,
					message: "Internal server error",
				};
			}
		},
		{
			query: "category.query",
			detail: {
				summary: "Get all categories",
				description: "Returns a list of all categories in the database.",
			},
		},
	)
	.get(
		"/options",
		async () => {
			try {
				const results = await getCategoryOptions();
				return results;
			} catch (error) {
				console.log(error);
				return {
					status: 500,
					message: "Internal server error",
				};
			}
		},
		{
			detail: {
				summary: "Get all category options",
				description: "Returns a list of all categories as dropdown options.",
			},
		},
	)
	.post(
		"/",
		({ body }) => {
			const result = createCategory({ data: body });
			return result;
		},
		{
			body: "category.create",
			detail: {
				summary: "Add a category",
				description:
					"Creates and stores a new category in the database using the provided details.",
			},
		},
	)
	.get(
		"/:categoryId",
		({ params }) => {
			const result = getCategory({ id: params.categoryId });
			return result;
		},
		{
			params: "category.identifier.params",
			detail: {
				summary: "Get a category by id",
				description: "Returns a category by id from the database.",
			},
		},
	)
	.put(
		"/:categoryId",
		({ params, body }) => {
			const result = updateCategory({ id: params.categoryId, data: body });
			return result;
		},
		{
			params: "category.identifier.params",
			body: "category.update",
			detail: {
				summary: "Update a category by id",
				description:
					"Updates a category by id in the database using the provided details.",
			},
		},
	)
	.delete(
		"/:categoryId",
		({ params }) => {
			const result = deleteCategory({ id: params.categoryId });
			return result;
		},
		{
			params: "category.identifier.params",
			detail: {
				summary: "Delete a category by id",
				description: "Deletes a category by id from the database.",
			},
		},
	);
