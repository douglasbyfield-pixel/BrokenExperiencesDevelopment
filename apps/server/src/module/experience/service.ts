import { db } from "@server/db";
import { experience, experienceImage, vote } from "@server/db/schema";
import { decrement, increment } from "@server/db/utils";
import { user, category } from "@server/db/schema";
import { eq, ilike, or, desc, inArray } from "drizzle-orm";
import { sendNewIssueNotification } from "@server/lib/email";
import type {
	ExperienceCreate,
	ExperienceQuery,
	ExperienceUpdate,
	ExperienceVote,
} from "./schema";

export const getExperiences = async (options: { query: ExperienceQuery; userId?: string }) => {
	// Optimized query - only select essential fields for map loading
	const experiences = await db.select({
		id: experience.id,
		reportedBy: experience.reportedBy,
		categoryId: experience.categoryId,
		title: experience.title,
		description: experience.description,
		latitude: experience.latitude,
		longitude: experience.longitude,
		address: experience.address,
		status: experience.status,
		priority: experience.priority,
		createdAt: experience.createdAt,
		resolvedAt: experience.resolvedAt,
		upvotes: experience.upvotes,
		downvotes: experience.downvotes,
	}).from(experience).orderBy(desc(experience.createdAt)).limit(100); // Add limit for performance

	console.log('📤 Retrieved experiences count:', experiences.length);
	if (experiences.length > 0) {
		console.log('📤 First experience:', experiences[0]);
	}

	// Get images separately
	const experienceIds = experiences.map(exp => exp.id);
	const images = await db.select().from(experienceImage).where(inArray(experienceImage.experienceId, experienceIds));

	// Get users separately
	const userIds = [...new Set(experiences.map(exp => exp.reportedBy))];
	const users = await db.select().from(user).where(inArray(user.id, userIds));

	// Get categories separately
	const categoryIds = [...new Set(experiences.map(exp => exp.categoryId))];
	const categories = await db.select().from(category).where(inArray(category.id, categoryIds));

	// Group by experience ID
	const imagesByExperience = new Map();
	images.forEach(img => {
		if (!imagesByExperience.has(img.experienceId)) {
			imagesByExperience.set(img.experienceId, []);
		}
		imagesByExperience.get(img.experienceId).push(img);
	});

	const usersById = new Map(users.map(u => [u.id, u]));
	const categoriesById = new Map(categories.map(c => [c.id, c]));

	// Combine everything
	const result = experiences.map(exp => ({
		...exp,
		experienceImages: imagesByExperience.get(exp.id) || [],
		reportedBy: usersById.get(exp.reportedBy) || null,
		category: categoriesById.get(exp.categoryId) || null,
		userVote: null,
	}));

	console.log('📤 Final result preview:', result.slice(0, 2));

	// If userId is provided, fetch their votes and add to experiences
	if (options.userId) {
		const userVotes = await db.query.vote.findMany({
			where: (vote, { eq }) => eq(vote.userId, options.userId as string),
		});

		const voteMap = new Map(
			userVotes.map(v => [v.experienceId, v.vote])
		);

		return result.map(exp => ({
			...exp,
			userVote: voteMap.get(exp.id) ?? null,
		}));
	}

	return result;
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

export const getMapMarkers = async () => {
	// Ultra-lightweight query for map markers only
	const markers = await db.select({
		id: experience.id,
		latitude: experience.latitude,
		longitude: experience.longitude,
		status: experience.status,
		priority: experience.priority,
		title: experience.title,
	}).from(experience)
	.where(eq(experience.status, 'pending')) // Only show pending issues
	.orderBy(desc(experience.createdAt))
	.limit(50); // Limit for performance

	return markers;
};

export const getNearbyExperiences = async (options: {
	query: ExperienceQuery;
}) => {
	console.log(options);
	return options;
};

export const createExperience = async (options: {
	userId: string;
	userData: { id: string; email: string; name: string; image?: string; emailVerified: boolean };
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
					image: options.userData.image,
					emailVerified: options.userData.emailVerified,
				}).onConflictDoNothing();
			} else {
				// Update user info to keep it in sync with Supabase auth
				console.log("✅ User exists, updating with latest data:", {
					oldName: existingUser.name,
					newName: options.userData.name,
					oldImage: existingUser.image,
					newImage: options.userData.image
				});
				await tx.update(user)
					.set({
						name: options.userData.name,
						email: options.userData.email,
						image: options.userData.image,
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

			// Save multiple images if provided
			let savedImages = [];
			console.log('📸 Processing images for experience:', newExperience.id);
			console.log('📸 Image URLs received:', data.imageUrls);
			
			if (data.imageUrls && data.imageUrls.length > 0) {
				for (const imageUrl of data.imageUrls) {
					console.log('💾 Saving image URL:', imageUrl);
					const [savedImage] = await tx
						.insert(experienceImage)
						.values({
							experienceId: newExperience.id,
							imageUrl: imageUrl,
						})
						.returning();
					savedImages.push(savedImage);
					console.log('✅ Image saved to DB:', savedImage.id);
				}
			} else {
				console.log('⚠️ No image URLs provided');
			}
			// Note: No placeholder images - only save real uploaded images

			console.log('📤 Returning experience with images:', {
				experienceId: newExperience.id,
				imageCount: savedImages.length,
				images: savedImages.map(img => ({ id: img.id, url: img.imageUrl }))
			});

			return {
				experience: newExperience,
				experienceImages: savedImages,
			};
		});

		// Send email notification only if user has email notifications enabled
		try {
			const { SettingsService } = await import("@server/module/settings/service");
			const userSettings = await SettingsService.getUserSettings(options.userId);
			
			// Only send email if user has email notifications enabled
			if (userSettings.notifications.email) {
				sendNewIssueNotification({
					id: createdExperience.experience.id,
					title: createdExperience.experience.title,
					description: createdExperience.experience.description,
					address: createdExperience.experience.address || undefined,
					reportedBy: {
						name: options.userData.name,
						email: options.userData.email
					}
				}).catch(error => {
					console.error('Failed to send email notification:', error);
					// Don't fail the request if email fails
				});
			} else {
				console.log('📧 Email notification skipped - user has disabled email notifications');
			}
		} catch (error) {
			console.error('Failed to check user notification settings:', error);
			// Don't fail the request if settings check fails
		}

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

export const deleteExperience = async (options: { id: string; userId: string }) => {
	// First verify the user owns this experience
	const existingExperience = await db.query.experience.findFirst({
		where: (experience, { eq }) => eq(experience.id, options.id),
	});

	if (!existingExperience) {
		throw new Error("Experience not found");
	}

	if (existingExperience.reportedBy !== options.userId) {
		throw new Error("You can only delete your own experiences");
	}

	// Delete the experience (cascade will handle votes and images)
	await db.delete(experience).where(eq(experience.id, options.id));

	return { success: true, id: options.id };
};
