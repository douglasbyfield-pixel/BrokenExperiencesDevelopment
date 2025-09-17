import Elysia from "elysia";
import { categoryModel } from "./schema";
import { createCategory, getCategories } from "./service";

export const categoryRouter = new Elysia({
    prefix: '/category',
    tags: ['category'],
})
    .use(categoryModel)
	.get("/", () => {
		const results = getCategories()
        return results
	}, {
        detail: {
            summary: 'Get all categories',
            description: 'Returns a list of all categories in the database.',
        }
    })
    .post('/', ({ body }) => {
        const result = createCategory({ data: body })
        return result
    }, {
        body: 'category.create',
        detail: {
            summary: 'Add a category',
            description: 'Creates and stores a new category in the database using the provided details.',
        }
    });