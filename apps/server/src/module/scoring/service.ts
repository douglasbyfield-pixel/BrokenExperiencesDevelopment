import { db } from "@server/db";
import { activityPoints, userProfile, ACTIVITY_POINTS } from "@server/db/schema";
import { eq } from "drizzle-orm";
import { increment } from "@server/db/utils";
import type { AwardPointsInput } from "./schema";

export class ScoringService {
	/**
	 * Award points to a user for a specific activity
	 */
	static async awardPoints(input: AwardPointsInput & { userId: string }) {
		// Get the point value for this activity type (10, 20, 15, or 30)
		const points = this.getPointsForActivity(input.activityType);
		
		return await db.transaction(async (tx) => {
			// Check if user already has an activity record
			const existingRecord = await tx.query.activityPoints.findFirst({
				where: (activity, { eq }) => eq(activity.userId, input.userId),
			});

			if (!existingRecord) {
				// First time user - create new activity record
				const counterUpdate = this.getCounterUpdateForActivity(input.activityType);
				await tx.insert(activityPoints).values({
					userId: input.userId,
					totalPoints: points, // Set initial total points
					...counterUpdate, // Set the specific counter to 1
				});
			} else {
				// Existing user - increment counter and add points
				const counterUpdate = this.getCounterUpdateForActivity(input.activityType);
				await tx
					.update(activityPoints)
					.set({
						totalPoints: increment(activityPoints.totalPoints, points), // Add points to existing total
						...counterUpdate, // Increment the specific activity counter
						updatedAt: new Date(),
					})
					.where(eq(activityPoints.userId, input.userId));
			}

			// Update user profile with the points for this activity
			await tx
				.insert(userProfile)
				.values({
					userId: input.userId,
					totalPoints: points, // For new users, set initial points
					currentLevelPoints: points,
				})
				.onConflictDoUpdate({
					target: userProfile.userId,
					set: {
						totalPoints: increment(userProfile.totalPoints, points), // Add points to existing total
						currentLevelPoints: increment(userProfile.currentLevelPoints, points), // Add to level progress
						updatedAt: new Date(),
					},
				});

			return { 
				success: true, 
				activityType: input.activityType,
				points: points, // Return the points awarded for this activity
			};
		});
	}


	/**
	 * Get points value for activity type
	 */
	private static getPointsForActivity(activityType: string): number {
		switch (activityType) {
			case "add_experience":
				return ACTIVITY_POINTS.ADD_EXPERIENCE;
			case "fix_experience":
				return ACTIVITY_POINTS.FIX_EXPERIENCE;
			case "verify_experience":
				return ACTIVITY_POINTS.VERIFY_EXPERIENCE;
			case "sponsor_experience":
				return ACTIVITY_POINTS.SPONSOR_EXPERIENCE;
			default:
				return 0;
		}
	}

	/**
	 * Get counter update for activity (increments the appropriate counter)
	 */
	private static getCounterUpdateForActivity(activityType: string) {
		switch (activityType) {
			case "add_experience":
				return { experiencesAdded: increment(activityPoints.experiencesAdded) };
			case "fix_experience":
				return { experiencesFixed: increment(activityPoints.experiencesFixed) };
			case "verify_experience":
				return { experiencesVerified: increment(activityPoints.experiencesVerified) };
			case "sponsor_experience":
				return { experiencesSponsored: increment(activityPoints.experiencesSponsored) };
			default:
				return {};
		}
	}
}