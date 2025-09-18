import type { ExperienceCreate, ExperienceUpdate } from "./schema";

export const getExperiences = async (options?: {}) => {
	return options;
};

export const createExperience = async (options?: { data: ExperienceCreate }) => {
	return options?.data;
};

export const getExperience = async (options?: { id: string }) => {
	return options?.id;
};

export const updateExperience = async (options?: { id: string, data: ExperienceUpdate }) => {
	return options?.id;
};

export const deleteExperience = async (options?: { id: string }) => {
	return options?.id;
};
