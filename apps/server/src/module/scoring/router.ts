import { Elysia } from "elysia";
import { supabaseSession } from "@server/lib/auth/view";
import { verifySupabaseToken } from "@server/lib/auth/supabase";
import { ScoringService } from "./service";
import { awardPointsSchema, getUserScoreSchema, getLeaderboardSchema } from "./schema";

export const scoringRouter = new Elysia({ prefix: "/scoring" })
	.use(supabaseSession)
	.post(
		"/award",
		async (ctx: any) => {
			try {
				// Get user from auth header
				const authHeader = ctx.request.headers.get('authorization') || ctx.request.headers.get('Authorization');
				if (!authHeader) {
					ctx.set.status = 401;
					return { success: false, error: "Unauthorized" };
				}
				
				const user = await verifySupabaseToken(authHeader);
				if (!user) {
					ctx.set.status = 401;
					return { success: false, error: "Invalid token" };
				}
				
				const result = await ScoringService.awardPoints({
					...ctx.body,
					userId: user.id,
				});
				
				ctx.set.status = 200;
				return {
					success: true,
					data: result,
				};
			} catch (error) {
				ctx.set.status = 500;
				return {
					success: false,
					error: error instanceof Error ? error.message : "Failed to award points",
				};
			}
		},
		{
			body: awardPointsSchema,
		}
	)
	.get(
		"/user/:userId",
		async ({ params, set }) => {
			try {
				// Get user score from activity points table
				const { db } = await import("@server/db");
				const { eq } = await import("drizzle-orm");
				const { activityPoints } = await import("@server/db/schema");
				
				const userScore = await db.query.activityPoints.findFirst({
					where: eq(activityPoints.userId, params.userId),
				});
				
				set.status = 200;
				return {
					success: true,
					data: userScore || {
						userId: params.userId,
						totalPoints: 0,
						experiencesAdded: 0,
						experiencesFixed: 0,
						experiencesVerified: 0,
						experiencesSponsored: 0,
					},
				};
			} catch (error) {
				set.status = 500;
				return {
					success: false,
					error: error instanceof Error ? error.message : "Failed to get user score",
				};
			}
		},
		{
			params: getUserScoreSchema,
		}
	)
	.get(
		"/leaderboard",
		async ({ query, set }) => {
			try {
				console.log("Leaderboard request - query params:", query);
				
				// Get leaderboard from activity points table with user info
				const { db } = await import("@server/db");
				const { desc } = await import("drizzle-orm");
				const { activityPoints } = await import("@server/db/schema");
				
				console.log("Database imports successful");
				
				// Simplified query - just get activity points for now
				const leaderboard = await db.query.activityPoints.findMany({
					orderBy: desc(activityPoints.totalPoints),
					limit: query.limit || 10,
					offset: query.offset || 0,
				});
				
				console.log("Leaderboard query result:", leaderboard);
				
				// Format the data for frontend
				const formattedLeaderboard = leaderboard.map((row, index) => ({
					id: row.userId || `user-${index}`,
					name: `User ${index + 1}`, // Will show real names once we fix user profiles
					avatar: undefined,
					totalPoints: row.totalPoints || 0,
					level: Math.floor((row.totalPoints || 0) / 100) + 1,
					experiencesAdded: row.experiencesAdded || 0,
					experiencesFixed: row.experiencesFixed || 0,
					experiencesVerified: row.experiencesVerified || 0,
					experiencesSponsored: row.experiencesSponsored || 0,
				}));
				
				set.status = 200;
				return {
					success: true,
					data: formattedLeaderboard,
				};
			} catch (error) {
				console.error("Leaderboard error:", error);
				
				// Check if it's a database table missing error
				if (error instanceof Error && (error.message.includes('relation "activity_points" does not exist') || error.message.includes('from "activity_points"'))) {
					console.warn("activity_points table not found. Returning empty leaderboard.");
					set.status = 200;
					return {
						success: true,
						data: [],
						warning: "The leaderboard table is not yet set up. Please run LEADERBOARD_SQL_SETUP.sql to enable the leaderboard."
					};
				}
				
				set.status = 500;
				return {
					success: false,
					error: error instanceof Error ? error.message : "Failed to get leaderboard",
				};
			}
		},
		{
			query: getLeaderboardSchema,
		}
	)
	.get(
		"/leaderboard/:category",
		async ({ params, query, set }) => {
			try {
				const { db } = await import("@server/db");
				const { desc } = await import("drizzle-orm");
				const { activityPoints } = await import("@server/db/schema");
				
				// Determine ordering based on category
				let orderByField;
				switch (params.category) {
					case 'experiencesAdded':
						orderByField = activityPoints.experiencesAdded;
						break;
					case 'experiencesFixed':
						orderByField = activityPoints.experiencesFixed;
						break;
					case 'experiencesVerified':
						orderByField = activityPoints.experiencesVerified;
						break;
					case 'experiencesSponsored':
						orderByField = activityPoints.experiencesSponsored;
						break;
					default:
						orderByField = activityPoints.totalPoints;
				}
				
				// Simplified query - just get activity points for now
				const leaderboard = await db.query.activityPoints.findMany({
					orderBy: desc(orderByField),
					limit: query.limit || 10,
					offset: query.offset || 0,
				});
				
				// Format with category-specific count
				const formattedLeaderboard = leaderboard.map((row, index) => {
					let count = 0;
					switch (params.category) {
						case 'experiencesAdded':
							count = row.experiencesAdded || 0;
							break;
						case 'experiencesFixed':
							count = row.experiencesFixed || 0;
							break;
						case 'experiencesVerified':
							count = row.experiencesVerified || 0;
							break;
						case 'experiencesSponsored':
							count = row.experiencesSponsored || 0;
							break;
						default:
							count = row.totalPoints || 0;
					}
					
					return {
						id: row.userId || `user-${index}`,
						name: `User ${index + 1}`, // Will show real names once we fix user profiles
						avatar: undefined,
						totalPoints: row.totalPoints || 0,
						level: Math.floor((row.totalPoints || 0) / 100) + 1,
						experiencesAdded: row.experiencesAdded || 0,
						experiencesFixed: row.experiencesFixed || 0,
						experiencesVerified: row.experiencesVerified || 0,
						experiencesSponsored: row.experiencesSponsored || 0,
						count,
					};
				});
				
				set.status = 200;
				return {
					success: true,
					data: formattedLeaderboard,
				};
			} catch (error) {
				console.error("Category leaderboard error:", error);
				
				// Check if it's a database table missing error
				if (error instanceof Error && (error.message.includes('relation "activity_points" does not exist') || error.message.includes('from "activity_points"'))) {
					console.warn("activity_points table not found. Returning empty leaderboard.");
					set.status = 200;
					return {
						success: true,
						data: [],
						warning: "The leaderboard table is not yet set up. Please run LEADERBOARD_SQL_SETUP.sql to enable the leaderboard."
					};
				}
				
				set.status = 500;
				return {
					success: false,
					error: error instanceof Error ? error.message : "Failed to get category leaderboard",
				};
			}
		},
		{
			query: getLeaderboardSchema,
		}
	)
	.get(
		"/user/:userId/rank",
		async ({ params, set }) => {
			try {
				const { db } = await import("@server/db");
				const { eq, count, gt } = await import("drizzle-orm");
				const { activityPoints } = await import("@server/db/schema");
				
				// Get user's points
				const userPoints = await db.query.activityPoints.findFirst({
					where: eq(activityPoints.userId, params.userId),
				});
				
				if (!userPoints) {
					set.status = 404;
					return { success: false, error: "User not found" };
				}
				
				// Count users with higher points (to get rank)
				const [rankResult] = await db
					.select({ count: count() })
					.from(activityPoints)
					.where(gt(activityPoints.totalPoints, userPoints.totalPoints || 0));
				
				// Get total users count
				const [totalResult] = await db
					.select({ count: count() })
					.from(activityPoints);
				
				const rank = (rankResult?.count || 0) + 1;
				const totalUsers = totalResult?.count || 0;
				const currentPoints = userPoints.totalPoints || 0;
				const currentLevel = Math.floor(currentPoints / 100) + 1;
				
				set.status = 200;
				return {
					success: true,
					data: {
						rank,
						totalUsers,
						currentPoints,
						nextLevelPoints: currentLevel * 100, // Points needed for next level
						currentLevel,
					},
				};
			} catch (error) {
				console.error("User rank error:", error);
				
				// Check if it's a database table missing error
				if (error instanceof Error && (error.message.includes('relation "activity_points" does not exist') || error.message.includes('from "activity_points"'))) {
					console.warn("activity_points table not found. Returning default rank.");
					set.status = 200;
					return {
						success: true,
						data: {
							rank: 1,
							totalUsers: 1,
							currentPoints: 0,
							nextLevelPoints: 100,
							currentLevel: 1,
						},
						warning: "The leaderboard table is not yet set up. Please run LEADERBOARD_SQL_SETUP.sql to enable the leaderboard."
					};
				}
				
				set.status = 500;
				return {
					success: false,
					error: error instanceof Error ? error.message : "Failed to get user rank",
				};
			}
		}
	);