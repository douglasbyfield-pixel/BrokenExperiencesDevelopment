import Elysia from "elysia";
import { reportCreateSchema, reportParamsSchema } from "./model";
import { createReport, getReport } from "./service";

export const reportRouter = new Elysia({
	prefix: "/report",
	tags: ["Report"],
})
	.post(
		"/",
		async ({ body }) => {
			const result = await createReport({ data: body });
			return result;
		},
		{
			body: reportCreateSchema,
			detail: {
				summary: "Create a new report",
				description:
					"Creates and stores a new report with the provided details from the broken experience form.",
			},
		},
	)
	.get(
		"/:id",
		({ params }) => {
			const result = getReport({ id: params.id });
			return result;
		},
		{
			params: reportParamsSchema,
			detail: {
				summary: "Get a report by ID",
				description:
					"Retrieves a specific report by its ID, including images and verification status.",
			},
		},
	);
