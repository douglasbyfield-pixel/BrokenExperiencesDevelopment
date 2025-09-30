import { createInsertSchema } from "drizzle-typebox";
import Elysia, { type Static, t } from "elysia";
import { ReportPriorityEnum, ReportStatusEnum, report } from "../../db/schema/report";

const baseReportInsertSchema = createInsertSchema(report);

export const reportCreateSchema = t.Object({
	description: baseReportInsertSchema.properties.description,
	categories: t.Array(t.String(), { default: [] }),
	latitude: t.Optional(baseReportInsertSchema.properties.latitude),
	longitude: t.Optional(baseReportInsertSchema.properties.longitude),
	status: t.Enum(ReportStatusEnum, { default: ReportStatusEnum.pending }),
	priority: t.Enum(ReportPriorityEnum, { default: ReportPriorityEnum.medium }),
	// For file uploads
	images: t.Optional(t.Files()),
});

export type ReportCreate = Static<typeof reportCreateSchema>;

export const reportModel = new Elysia().model({
	"report.create": reportCreateSchema,
});
