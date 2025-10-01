import { createInsertSchema } from "drizzle-typebox";
import Elysia, { type Static, t } from "elysia";
import {
  ExperiencePriorityEnum,
  ExperienceStatusEnum,
  experience,
} from "../../db/schema/experience";

const baseExperienceInsertSchema = createInsertSchema(experience);

export const latitudeSchema = t.String({
  pattern: "^-?\\d+(\\.\\d+)?$",
  description: "Latitude stored as string",
});

export const longitudeSchema = t.String({
  pattern: "^-?\\d+(\\.\\d+)?$",
  description: "Longitude stored as string",
});

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
    latitude: t.Optional(latitudeSchema),
    longitude: t.Optional(longitudeSchema),
    radius: t.Optional(t.Number({ default: 5000 })),
    limit: t.Optional(t.Number({ default: 10 })),
  }),
);

// ✅ FIXED: Made status and priority Optional
export const experienceCreateSchema = t.Object({
  title: t.String({ minLength: 5, maxLength: 100 }),
  description: t.String({ minLength: 5, maxLength: 1000 }),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  address: t.String({ minLength: 5, maxLength: 100 }),
  categoryId: t.String({ format: "uuid" }),
  status: t.Optional(
    t.Enum(ExperienceStatusEnum, {
      default: ExperienceStatusEnum.pending,
    })
  ),
  priority: t.Optional(
    t.Enum(ExperiencePriorityEnum, {
      default: ExperiencePriorityEnum.medium,
    })
  ),
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