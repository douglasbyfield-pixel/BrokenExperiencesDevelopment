import { db } from "@/db";
import type {
	ExperienceCreate,
	ExperienceQuery,
	ExperienceUpdate,
} from "./schema";
import { experience, experienceImage } from "@/db/schema";

export const getExperiences = async (options: { query: ExperienceQuery }) => {
	console.log(options);
	return options;
};

export const createExperience = async (options: { data: ExperienceCreate }) => {
	const { data } = options;

	const createdExperience = await db.transaction(async (tx) => {
		const [newExperience] = await tx
			.insert(experience)
			.values({
				title: data.title,
				description: data.description,
				latitude: data.latitude,
				longitude: data.longitude,
				address: data.address,
				categoryId: data.categoryId,
				status: data.status,
				priority: data.priority,
			})
			.returning();

		const [newExperienceImage] = await tx
			.insert(experienceImage)
			.values({
				experienceId: newExperience.id,
				imageUrl: data.experience_images[0].name,
			})
			.returning();

		return {
			experience: newExperience,
			experienceImage: newExperienceImage,
		};
	});

	return createdExperience;
};

export const getExperience = async (options?: { id: string }) => {
	const getExperience = await db.query.experience.findFirst({
		where: (experience, { eq }) => eq(experience.id, options?.id as string),
		with: { experienceImages: true },
	});

	return getExperience;
};

export const updateExperience = async (options?: {
	id: string;
	data: ExperienceUpdate;
}) => {
	return options?.id;
};

export const deleteExperience = async (options?: { id: string }) => {
	return options?.id;
};
