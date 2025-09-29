import { db } from "@server/db";
import { experience, experienceImage, vote } from "@server/db/schema";
import { decrement, increment } from "@server/db/utils";
import { eq } from "drizzle-orm";
import type {
	ExperienceCreate,
	ExperienceQuery,
	ExperienceUpdate,
	ExperienceVote,
} from "./schema";

export const getExperiences = async (_options: { query: ExperienceQuery }) => {
	const retrievedExperiences = await db.query.experience.findMany({
		with: { experienceImages: true, reportedBy: true, category: true },
		orderBy: (experience, { desc }) => [desc(experience.createdAt)],
	});
	return retrievedExperiences;
};

export const getNearbyExperiences = async (options: {
	query: ExperienceQuery;
}) => {
	console.log(options);
	return options;
};

export const createExperience = async (options: {
	userId: string;
	data: ExperienceCreate;
}) => {
	const { data } = options;

	const createdExperience = await db.transaction(async (tx) => {
		const [newExperience] = await tx
			.insert(experience)
			.values({
				title: data.title,
				reportedBy: options.userId,
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
				imageUrl: "https://via.placeholder.com/150",
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

export const voteOnExperience = async (options: {
	id: string;
	userId: string;
	data: ExperienceVote;
}) => {
	const voteAlreadyExists = await db.query.vote.findFirst({
		where: (vote, { eq }) =>
			eq(vote.experienceId, options.id) && eq(vote.userId, options.userId),
	});

	if (voteAlreadyExists && voteAlreadyExists.vote === options.data.vote) {
		return voteAlreadyExists;
	}

	// If vote exists and is opposite, remove the vote and decrement the corresponding column
	if (voteAlreadyExists && voteAlreadyExists.vote !== options.data.vote) {
		const votedExperience = await db.transaction(async (tx) => {
			// Remove the vote
			await tx.delete(vote).where(eq(vote.id, voteAlreadyExists.id));

			// Decrement the corresponding column
			const [updatedExperience] = await tx
				.update(experience)
				.set(
					voteAlreadyExists.vote
						? { upvotes: decrement(experience.upvotes) }
						: { downvotes: decrement(experience.downvotes) },
				)
				.where(eq(experience.id, options.id))
				.returning();

			return updatedExperience;
		});
		return votedExperience;
	}

	// If no vote exists, add the vote and increment the corresponding column
	const votedExperience = await db.transaction(async (tx) => {
		const [newVote] = await tx
			.insert(vote)
			.values({
				experienceId: options.id,
				userId: options.userId,
				vote: options.data.vote,
			})
			.returning();

		const [updatedExperience] = await tx
			.update(experience)
			.set(
				newVote.vote
					? { upvotes: increment(experience.upvotes) }
					: { downvotes: increment(experience.downvotes) },
			)
			.where(eq(experience.id, options.id))
			.returning();

		return updatedExperience;
	});

	return votedExperience;
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
