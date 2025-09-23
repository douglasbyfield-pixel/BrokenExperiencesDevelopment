import type { ExperiencePriorityEnum, ExperienceStatusEnum } from "@/db/schema";

export type ExperienceStatus =
	(typeof ExperienceStatusEnum)[keyof typeof ExperienceStatusEnum];
export type ExperiencePriority =
	(typeof ExperiencePriorityEnum)[keyof typeof ExperiencePriorityEnum];
