import { z } from "zod";

export const reportCreateSchema = z.object({
	description: z.string(),
	categories: z.array(z.string()),
	latitude: z.string().optional(),
	longitude: z.string().optional(),
});

export type ReportCreate = z.infer<typeof reportCreateSchema>;

export const reportParamsSchema = z.object({
	id: z.string().uuid(),
});

export type ReportParams = z.infer<typeof reportParamsSchema>;
