import { createInsertSchema } from "drizzle-typebox";
import Elysia, { type Static, t } from "elysia";
import {
	ExperiencePriorityEnum,
	ExperienceStatusEnum,
	experience,
} from "../../db/schema/experience";

const baseExperienceInsertSchema = createInsertSchema(experience);

const experienceQuerySchema = t.Optional(
	t.Object({
		status: t.Optional(
			t.Enum(ExperienceStatusEnum, {
				default: ExperienceStatusEnum.pending,
			}),
		),
		priority: t.Optional(
			t.Enum(ExperiencePriorityEnum, {
				default: ExperiencePriorityEnum.medium,
			}),
		),
		latitude: t.Optional(t.Number()),
		longitude: t.Optional(t.Number()),
		radius: t.Optional(t.Number({ default: 5000 })),
		limit: t.Optional(t.Number({ default: 10 })),
	}),
);

export const experienceCreateSchema = t.Object({
	title: baseExperienceInsertSchema.properties.title,
	description: baseExperienceInsertSchema.properties.description,
	latitude: baseExperienceInsertSchema.properties.latitude,
	longitude: baseExperienceInsertSchema.properties.longitude,
	address: baseExperienceInsertSchema.properties.address,
	categoryId: baseExperienceInsertSchema.properties.categoryId,
	status: t.Enum(ExperienceStatusEnum, {
		default: ExperienceStatusEnum.pending,
	}),
	priority: t.Enum(ExperiencePriorityEnum, {
		default: ExperiencePriorityEnum.medium,
	}),
	// experience_images: t.Files(),
});

export const experienceUpdateSchema = t.Partial(experienceCreateSchema);

export const experienceVoteSchema = t.Object({
	vote: t.Boolean(),
});

export type ExperienceVote = Static<typeof experienceVoteSchema>;
export type ExperienceCreate = Static<typeof experienceCreateSchema>;
export type ExperienceUpdate = Static<typeof experienceUpdateSchema>;
export type ExperienceQuery = Static<typeof experienceQuerySchema>;

export const experienceModel = new Elysia().model({
	"experience.identifier.params": t.Object({
		experienceId: t.String({ format: "uuid" }),
	}),
	"experience.vote": experienceVoteSchema,
	"experience.nearby.query": experienceQuerySchema,
	"experience.create": experienceCreateSchema,
	"experience.update": experienceUpdateSchema,
	"experience.query": experienceQuerySchema,
});
