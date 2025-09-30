import { db } from "@server/db";
import { experience, experienceImage, vote } from "@server/db/schema";
import { decrement, increment } from "@server/db/utils";
import { user } from "@server/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import type {
	ExperienceCreate,
	ExperienceQuery,
	ExperienceUpdate,
	ExperienceVote,
} from "./schema";

export const getExperiences = async (options: { query: ExperienceQuery; userId?: string }) => {
	const retrievedExperiences = await db.query.experience.findMany({
		with: { experienceImages: true, reportedBy: true, category: true },
		orderBy: (experience, { desc }) => [desc(experience.createdAt)],
	});

	// If userId is provided, fetch their votes and add to experiences
	if (options.userId) {
		const userVotes = await db.query.vote.findMany({
			where: (vote, { eq }) => eq(vote.userId, options.userId as string),
		});

		const voteMap = new Map(
			userVotes.map(v => [v.experienceId, v.vote])
		);

		return retrievedExperiences.map(exp => ({
			...exp,
			userVote: voteMap.get(exp.id) ?? null,
		}));
	}

	return retrievedExperiences.map(exp => ({
		...exp,
		userVote: null,
	}));
};

export const searchExperiences = async (searchTerm: string, userId?: string) => {
	const searchPattern = `%${searchTerm}%`;
	const searchResults = await db.query.experience.findMany({
		where: or(
			ilike(experience.title, searchPattern),
			ilike(experience.description, searchPattern),
			ilike(experience.address, searchPattern)
		),
		with: { experienceImages: true, reportedBy: true, category: true },
		orderBy: (experience, { desc }) => [desc(experience.createdAt)],
		limit: 20,
	});

	// If userId is provided, fetch their votes and add to experiences
	if (userId) {
		const userVotes = await db.query.vote.findMany({
			where: (vote, { eq }) => eq(vote.userId, userId),
		});

		const voteMap = new Map(
			userVotes.map(v => [v.experienceId, v.vote])
		);

		return searchResults.map(exp => ({
			...exp,
			userVote: voteMap.get(exp.id) ?? null,
		}));
	}

	return searchResults.map(exp => ({
		...exp,
		userVote: null,
	}));
};

export const getNearbyExperiences = async (options: {
	query: ExperienceQuery;
}) => {
	console.log(options);
	return options;
};

export const createExperience = async (options: {
	userId: string;
	userData: { id: string; email: string; name: string; emailVerified: boolean };
	data: ExperienceCreate;
}) => {
	console.log("📝 createExperience called with:", {
		userId: options.userId,
		data: options.data
	});
	
	try {
		const { data } = options;

		const createdExperience = await db.transaction(async (tx) => {
			// Ensure user exists in the database and update their info if needed
			const existingUser = await tx.query.user.findFirst({
				where: (user, { eq }) => eq(user.id, options.userId)
			});

			if (!existingUser) {
				console.log("⚠️ User doesn't exist in DB, creating with real data:", options.userData);
				await tx.insert(user).values({
					id: options.userData.id,
					name: options.userData.name,
					email: options.userData.email,
					emailVerified: options.userData.emailVerified,
				}).onConflictDoNothing();
			} else {
				// Update user info to keep it in sync with Supabase auth
				console.log("✅ User exists, updating with latest data:", {
					oldName: existingUser.name,
					newName: options.userData.name
				});
				await tx.update(user)
					.set({
						name: options.userData.name,
						email: options.userData.email,
						emailVerified: options.userData.emailVerified,
					})
					.where(eq(user.id, options.userId));
			}

			const [newExperience] = await tx
				.insert(experience)
				.values({
					title: data.title,
					reportedBy: options.userId,
					description: data.description,
					latitude: String(data.latitude), 
					longitude: String(data.longitude), 
					address: data.address,
					categoryId: data.categoryId,
					status: data.status || 'pending', 
					priority: data.priority || 'medium',
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
	} catch (error) {
		console.error("❌ Error in createExperience:", error);
		throw error;
	}
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

	// If user is voting the same way again, toggle it off (remove the vote)
	if (voteAlreadyExists && voteAlreadyExists.vote === options.data.vote) {
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

			return { ...updatedExperience, userVote: null };
		});
		return votedExperience;
	}

	// If vote exists and is opposite, switch the vote
	if (voteAlreadyExists && voteAlreadyExists.vote !== options.data.vote) {
		const votedExperience = await db.transaction(async (tx) => {
			// Update the vote
			await tx.update(vote)
				.set({ vote: options.data.vote })
				.where(eq(vote.id, voteAlreadyExists.id));

			// Decrement old vote type and increment new vote type
			const [updatedExperience] = await tx
				.update(experience)
				.set(
					voteAlreadyExists.vote
						? { 
							upvotes: decrement(experience.upvotes),
							downvotes: increment(experience.downvotes)
						}
						: { 
							upvotes: increment(experience.upvotes),
							downvotes: decrement(experience.downvotes)
						},
				)
				.where(eq(experience.id, options.id))
				.returning();

			return { ...updatedExperience, userVote: options.data.vote };
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

		return { ...updatedExperience, userVote: options.data.vote };
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
