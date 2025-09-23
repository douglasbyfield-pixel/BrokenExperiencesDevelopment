import { createInsertSchema } from "drizzle-typebox";
import Elysia, { type Static, t } from "elysia";
import { ExperiencePriorityEnum, ExperienceStatusEnum, experience } from "../../db/schema/experience";

const baseExperienceInsertSchema = createInsertSchema(experience);

const experienceQuerySchema = t.Object({
    severity: t.Optional(t.String()),
    status: t.Optional(t.String()),
    north: t.Optional(t.String()),
    south: t.Optional(t.String()),
    east: t.Optional(t.String()),
    west: t.Optional(t.String())
});

export const experienceCreateSchema = t.Object({
	title: baseExperienceInsertSchema.properties.title,
	description: baseExperienceInsertSchema.properties.description,
	latitude: baseExperienceInsertSchema.properties.latitude,
	longitude: baseExperienceInsertSchema.properties.longitude,
	address: baseExperienceInsertSchema.properties.address,
	category_id: baseExperienceInsertSchema.properties.category_id,
	status: t.Enum(ExperienceStatusEnum, {default: ExperienceStatusEnum.pending}),
	priority: t.Enum(ExperiencePriorityEnum, {default: ExperiencePriorityEnum.medium}),
	experience_images: t.Files()
});

export const experienceUpdateSchema = t.Partial(experienceCreateSchema);

export type ExperienceCreate = Static<typeof experienceCreateSchema>;
export type ExperienceUpdate = Static<typeof experienceUpdateSchema>;
export type ExperienceQuery = Static<typeof experienceQuerySchema>;

export const experienceModel = new Elysia().model({
	"experience.identifier.params": t.Object({ experienceId: t.String({ format: "uuid" }) }),
	"experience.create": experienceCreateSchema,
	"experience.update": experienceUpdateSchema,
	"experience.query": experienceQuerySchema,
});
