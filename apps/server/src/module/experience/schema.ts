import { createInsertSchema } from "drizzle-typebox";
import Elysia, { type Static, t } from "elysia";
import { experience } from "../../db/schema/experience";

const baseExperienceInsertSchema = createInsertSchema(experience);

const experienceQuerySchema = t.Object({
	limit: t.Number({ default: 10 }),
	offset: t.Number({ default: 0 }),
	query: t.Optional(t.String({ default: undefined })),
	page: t.Optional(t.Number({ default: 1 })),
});

export const experienceCreateSchema = t.Object({
	title: baseExperienceInsertSchema.properties.title,
	description: baseExperienceInsertSchema.properties.description,
	latitude: baseExperienceInsertSchema.properties.latitude,
	longitude: baseExperienceInsertSchema.properties.longitude,
	address: baseExperienceInsertSchema.properties.address,
	category: baseExperienceInsertSchema.properties.category,
	status: baseExperienceInsertSchema.properties.status,
	priority: baseExperienceInsertSchema.properties.priority,
});

export const experienceUpdateSchema = t.Partial(experienceCreateSchema);

export type ExperienceCreate = Static<typeof experienceCreateSchema>;
export type ExperienceUpdate = Static<typeof experienceUpdateSchema>;
export type ExperienceQuery = Static<typeof experienceQuerySchema>;

export const experienceModel = new Elysia().model({
	"experience.identifier.params": t.Object({
		experienceId: t.String({ format: "uuid" }),
	}),
	"experience.create": experienceCreateSchema,
	"experience.update": experienceUpdateSchema,
	"experience.query": experienceQuerySchema,
});
