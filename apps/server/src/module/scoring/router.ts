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
				// Get leaderboard from activity points table with user info
				const { db } = await import("@server/db");
				const { desc, sql } = await import("drizzle-orm");
				const { activityPoints, userProfile } = await import("@server/db/schema");
				
				// Join with user_profile to get real names and avatars
				const leaderboard = await db
					.select({
						userId: activityPoints.userId,
						totalPoints: activityPoints.totalPoints,
						experiencesAdded: activityPoints.experiencesAdded,
						experiencesFixed: activityPoints.experiencesFixed,
						experiencesVerified: activityPoints.experiencesVerified,
						experiencesSponsored: activityPoints.experiencesSponsored,
						displayName: userProfile.display_name,
						handle: userProfile.handle,
						avatarUrl: userProfile.avatar_url,
					})
					.from(activityPoints)
					.leftJoin(userProfile, sql`${activityPoints.userId}::text = ${userProfile.auth_user_id}`)
					.orderBy(desc(activityPoints.totalPoints))
					.limit(query.limit || 10)
					.offset(query.offset || 0);
				
				// Format the data for frontend
				const formattedLeaderboard = leaderboard.map((row, index) => ({
					id: row.userId || `user-${index}`,
					name: row.displayName || row.handle || `User ${index + 1}`,
					avatar: row.avatarUrl || undefined,
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
				const { desc, sql } = await import("drizzle-orm");
				const { activityPoints, userProfile } = await import("@server/db/schema");
				
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
				
				// Join with user_profile to get real names and avatars
				const leaderboard = await db
					.select({
						userId: activityPoints.userId,
						totalPoints: activityPoints.totalPoints,
						experiencesAdded: activityPoints.experiencesAdded,
						experiencesFixed: activityPoints.experiencesFixed,
						experiencesVerified: activityPoints.experiencesVerified,
						experiencesSponsored: activityPoints.experiencesSponsored,
						displayName: userProfile.display_name,
						handle: userProfile.handle,
						avatarUrl: userProfile.avatar_url,
					})
					.from(activityPoints)
					.leftJoin(userProfile, sql`${activityPoints.userId}::text = ${userProfile.auth_user_id}`)
					.orderBy(desc(orderByField))
					.limit(query.limit || 10)
					.offset(query.offset || 0);
				
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
						name: row.displayName || row.handle || `User ${index + 1}`,
						avatar: row.avatarUrl || undefined,
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
				set.status = 500;
				return {
					success: false,
					error: error instanceof Error ? error.message : "Failed to get user rank",
				};
			}
		}
	);