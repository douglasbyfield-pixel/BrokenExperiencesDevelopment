import { db } from "@server/db";
import { ACTIVITY_POINTS, activityPoints, user } from "@server/db/schema";
import { increment } from "@server/db/utils";
import { count, desc, eq, gt, inArray, sql } from "drizzle-orm";
import type { AwardPointsInput } from "./schema";

export class ScoringService {
	/**
	 * Award points to a user for a specific activity
	 */
	static async awardPoints(input: AwardPointsInput & { userId: string }) {
		// Get the point value for this activity type (10, 20, 15, or 30)
		const points = ScoringService.getPointsForActivity(input.activityType);

		return await db.transaction(async (tx) => {
			// Check if user already has an activity record
			const existingRecord = await tx.query.activityPoints.findFirst({
				where: (activity, { eq }) => eq(activity.userId, input.userId),
			});

			if (!existingRecord) {
				// First time user - create new activity record
				const counterUpdate = ScoringService.getCounterUpdateForActivity(
					input.activityType,
				);
				await tx.insert(activityPoints).values({
					userId: input.userId,
					totalPoints: points, // Set initial total points
					...counterUpdate, // Set the specific counter to 1
				});
			} else {
				// Existing user - increment counter and add points
				const counterUpdate = ScoringService.getCounterUpdateForActivity(
					input.activityType,
				);
				await tx
					.update(activityPoints)
					.set({
						totalPoints: increment(activityPoints.totalPoints, points), // Add points to existing total
						...counterUpdate, // Increment the specific activity counter
						updatedAt: new Date(),
					})
					.where(eq(activityPoints.userId, input.userId));
			}

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
				return {
					experiencesVerified: increment(activityPoints.experiencesVerified),
				};
			case "sponsor_experience":
				return {
					experiencesSponsored: increment(activityPoints.experiencesSponsored),
				};
			default:
				return {};
		}
	}

	/**
	 * Get user score from activity points table
	 */
	static async getUserScore(userId: string) {
		const userScore = await db.query.activityPoints.findFirst({
			where: eq(activityPoints.userId, userId),
		});

		return (
			userScore || {
				userId,
				totalPoints: 0,
				experiencesAdded: 0,
				experiencesFixed: 0,
				experiencesVerified: 0,
				experiencesSponsored: 0,
			}
		);
	}

	/**
	 * Get leaderboard data with user information
	 */
	static async getLeaderboard(limit = 10, offset = 0) {
		try {
			// Use the leaderboard_display view that properly joins with Supabase Auth users
			const result = await db.execute(sql`
        SELECT 
          user_id,
          name,
          avatar,
          total_points,
          level,
          experiences_added,
          experiences_fixed,
          experiences_verified,
          experiences_sponsored,
          rank,
          total_users
        FROM public.leaderboard_display 
        WHERE total_points > 0
        ORDER BY total_points DESC, user_id
        LIMIT ${limit} OFFSET ${offset}
      `);

			return result.map((row: any) => ({
				id: row.user_id,
				name: row.name || "Anonymous User",
				avatar: row.avatar || undefined,
				totalPoints: row.total_points || 0,
				level: row.level || 1,
				experiencesAdded: row.experiences_added || 0,
				experiencesFixed: row.experiences_fixed || 0,
				experiencesVerified: row.experiences_verified || 0,
				experiencesSponsored: row.experiences_sponsored || 0,
			}));
		} catch (error) {
			console.error("Error fetching leaderboard from view:", error);

			// Fallback to original method if view doesn't exist
			const leaderboard = await db.query.activityPoints.findMany({
				orderBy: desc(activityPoints.totalPoints),
				limit: limit * 2,
				offset,
			});

			const userIds = leaderboard.map((row) => row.userId).filter(Boolean);
			const users = await db
				.select()
				.from(user)
				.where(inArray(user.id, userIds));
			const usersById = new Map(users.map((u) => [u.id, u]));

			const validLeaderboard = leaderboard
				.filter((row) => {
					const userData = usersById.get(row.userId);
					return (
						userData &&
						(userData.name || userData.email) &&
						(row.totalPoints || 0) > 0
					);
				})
				.slice(0, limit)
				.map((row) => {
					const userData = usersById.get(row.userId);
					return {
						id: row.userId,
						name:
							userData?.name ||
							userData?.email?.split("@")[0] ||
							"Unknown User",
						avatar: userData?.image || undefined,
						totalPoints: row.totalPoints || 0,
						level: Math.floor((row.totalPoints || 0) / 100) + 1,
						experiencesAdded: row.experiencesAdded || 0,
						experiencesFixed: row.experiencesFixed || 0,
						experiencesVerified: row.experiencesVerified || 0,
						experiencesSponsored: row.experiencesSponsored || 0,
					};
				});

			return validLeaderboard;
		}
	}

	/**
	 * Get category-specific leaderboard data with user information
	 */
	static async getCategoryLeaderboard(
		category: string,
		limit = 10,
		offset = 0,
	) {
		try {
			// Determine ordering and count field based on category
			let orderByClause;
			let countField;
			switch (category) {
				case "experiencesAdded":
					orderByClause = "experiences_added DESC, user_id";
					countField = "experiences_added";
					break;
				case "experiencesFixed":
					orderByClause = "experiences_fixed DESC, user_id";
					countField = "experiences_fixed";
					break;
				case "experiencesVerified":
					orderByClause = "experiences_verified DESC, user_id";
					countField = "experiences_verified";
					break;
				case "experiencesSponsored":
					orderByClause = "experiences_sponsored DESC, user_id";
					countField = "experiences_sponsored";
					break;
				default:
					orderByClause = "total_points DESC, user_id";
					countField = "total_points";
			}

			// Use the leaderboard_display view that properly joins with Supabase Auth users
			const result = await db.execute(sql`
        SELECT 
          user_id,
          name,
          avatar,
          total_points,
          level,
          experiences_added,
          experiences_fixed,
          experiences_verified,
          experiences_sponsored,
          ${sql.raw(countField)} as count
        FROM public.leaderboard_display 
        WHERE total_points > 0
        ORDER BY ${sql.raw(orderByClause)}
        LIMIT ${limit} OFFSET ${offset}
      `);

			return result.map((row: any) => ({
				id: row.user_id,
				name: row.name || "Anonymous User",
				avatar: row.avatar || undefined,
				totalPoints: row.total_points || 0,
				level: row.level || 1,
				experiencesAdded: row.experiences_added || 0,
				experiencesFixed: row.experiences_fixed || 0,
				experiencesVerified: row.experiences_verified || 0,
				experiencesSponsored: row.experiences_sponsored || 0,
				count: row.count || 0,
			}));
		} catch (error) {
			console.error("Error fetching category leaderboard from view:", error);

			// Fallback to original method if view doesn't exist
			let orderByField;
			switch (category) {
				case "experiencesAdded":
					orderByField = activityPoints.experiencesAdded;
					break;
				case "experiencesFixed":
					orderByField = activityPoints.experiencesFixed;
					break;
				case "experiencesVerified":
					orderByField = activityPoints.experiencesVerified;
					break;
				case "experiencesSponsored":
					orderByField = activityPoints.experiencesSponsored;
					break;
				default:
					orderByField = activityPoints.totalPoints;
			}

			const leaderboard = await db.query.activityPoints.findMany({
				orderBy: desc(orderByField),
				limit: limit * 2,
				offset,
			});

			const userIds = leaderboard.map((row) => row.userId).filter(Boolean);
			const users = await db
				.select()
				.from(user)
				.where(inArray(user.id, userIds));
			const usersById = new Map(users.map((u) => [u.id, u]));

			const validLeaderboard = leaderboard
				.filter((row) => {
					const userData = usersById.get(row.userId);
					return (
						userData &&
						(userData.name || userData.email) &&
						(row.totalPoints || 0) > 0
					);
				})
				.slice(0, limit)
				.map((row) => {
					const userData = usersById.get(row.userId);
					let count = 0;
					switch (category) {
						case "experiencesAdded":
							count = row.experiencesAdded || 0;
							break;
						case "experiencesFixed":
							count = row.experiencesFixed || 0;
							break;
						case "experiencesVerified":
							count = row.experiencesVerified || 0;
							break;
						case "experiencesSponsored":
							count = row.experiencesSponsored || 0;
							break;
						default:
							count = row.totalPoints || 0;
					}
					return {
						id: row.userId,
						name:
							userData?.name ||
							userData?.email?.split("@")[0] ||
							"Unknown User",
						avatar: userData?.image || undefined,
						totalPoints: row.totalPoints || 0,
						level: Math.floor((row.totalPoints || 0) / 100) + 1,
						experiencesAdded: row.experiencesAdded || 0,
						experiencesFixed: row.experiencesFixed || 0,
						experiencesVerified: row.experiencesVerified || 0,
						experiencesSponsored: row.experiencesSponsored || 0,
						count,
					};
				});

			return validLeaderboard;
		}
	}

	/**
	 * Get user rank statistics
	 */
	static async getUserRank(userId: string) {
		// Get user's points
		const userPoints = await db.query.activityPoints.findFirst({
			where: eq(activityPoints.userId, userId),
		});

		const currentPoints = userPoints?.totalPoints || 0;
		const currentLevel = Math.floor(currentPoints / 100) + 1;

		// If user has 0 points, they are unranked
		if (currentPoints === 0) {
			// Get total users count for context
			const [totalResult] = await db
				.select({ count: count() })
				.from(activityPoints);

			const totalUsers = totalResult?.count || 0;
			return {
				rank: null, // Unranked
				totalUsers,
				currentPoints: 0,
				nextLevelPoints: 100, // Need 100 points to get to level 2
				currentLevel: 1,
				isUnranked: true,
			};
		}

		// Count users with higher points (to get rank)
		const [rankResult] = await db
			.select({ count: count() })
			.from(activityPoints)
			.where(gt(activityPoints.totalPoints, currentPoints));

		// Get total users count
		const [totalResult] = await db
			.select({ count: count() })
			.from(activityPoints);

		const rank = (rankResult?.count || 0) + 1;
		const totalUsers = totalResult?.count || 0;

		return {
			rank,
			totalUsers,
			currentPoints,
			nextLevelPoints: currentLevel * 100, // Points needed for next level
			currentLevel,
			isUnranked: false,
		};
	}
}
