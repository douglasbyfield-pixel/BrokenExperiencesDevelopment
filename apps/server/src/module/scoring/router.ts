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
				
				// Use raw SQL to join with both user_profile and auth.users for fallback names
				const leaderboardResult = await db.execute(sql`
					SELECT 
						ap.user_id,
						ap.total_points,
						ap.experiences_added,
						ap.experiences_fixed,
						ap.experiences_verified,
						ap.experiences_sponsored,
						COALESCE(
							up.display_name, 
							up.handle, 
							au.raw_user_meta_data->>'full_name',
							au.raw_user_meta_data->>'name',
							SPLIT_PART(au.email, '@', 1),
							'Anonymous User'
						) as name,
						COALESCE(up.avatar_url, au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture') as avatar
					FROM activity_points ap
					LEFT JOIN user_profile up ON ap.user_id::text = up.auth_user_id
					LEFT JOIN auth.users au ON ap.user_id = au.id
					ORDER BY ap.total_points DESC
					LIMIT ${query.limit || 10}
					OFFSET ${query.offset || 0}
				`);
				
				const leaderboard = leaderboardResult.rows as any[];
				
				// Format the data for frontend
				const formattedLeaderboard = leaderboard.map((row, index) => ({
					id: row.user_id || `user-${index}`,
					name: row.name || `User ${index + 1}`,
					avatar: row.avatar || undefined,
					totalPoints: row.total_points || 0,
					level: Math.floor((row.total_points || 0) / 100) + 1,
					experiencesAdded: row.experiences_added || 0,
					experiencesFixed: row.experiences_fixed || 0,
					experiencesVerified: row.experiences_verified || 0,
					experiencesSponsored: row.experiences_sponsored || 0,
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
				let orderByField = 'ap.total_points';
				switch (params.category) {
					case 'experiencesAdded':
						orderByField = 'ap.experiences_added';
						break;
					case 'experiencesFixed':
						orderByField = 'ap.experiences_fixed';
						break;
					case 'experiencesVerified':
						orderByField = 'ap.experiences_verified';
						break;
					case 'experiencesSponsored':
						orderByField = 'ap.experiences_sponsored';
						break;
					default:
						orderByField = 'ap.total_points';
				}
				
				// Use raw SQL to join with both user_profile and auth.users for fallback names
				const leaderboardResult = await db.execute(sql`
					SELECT 
						ap.user_id,
						ap.total_points,
						ap.experiences_added,
						ap.experiences_fixed,
						ap.experiences_verified,
						ap.experiences_sponsored,
						COALESCE(
							up.display_name, 
							up.handle, 
							au.raw_user_meta_data->>'full_name',
							au.raw_user_meta_data->>'name',
							SPLIT_PART(au.email, '@', 1),
							'Anonymous User'
						) as name,
						COALESCE(up.avatar_url, au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture') as avatar
					FROM activity_points ap
					LEFT JOIN user_profile up ON ap.user_id::text = up.auth_user_id
					LEFT JOIN auth.users au ON ap.user_id = au.id
					ORDER BY ${sql.raw(orderByField)} DESC
					LIMIT ${query.limit || 10}
					OFFSET ${query.offset || 0}
				`);
				
				const leaderboard = leaderboardResult.rows as any[];
				
				// Format with category-specific count
				const formattedLeaderboard = leaderboard.map((row, index) => {
					let count = 0;
					switch (params.category) {
						case 'experiencesAdded':
							count = row.experiences_added || 0;
							break;
						case 'experiencesFixed':
							count = row.experiences_fixed || 0;
							break;
						case 'experiencesVerified':
							count = row.experiences_verified || 0;
							break;
						case 'experiencesSponsored':
							count = row.experiences_sponsored || 0;
							break;
						default:
							count = row.total_points || 0;
					}
					
					return {
						id: row.user_id || `user-${index}`,
						name: row.name || `User ${index + 1}`,
						avatar: row.avatar || undefined,
						totalPoints: row.total_points || 0,
						level: Math.floor((row.total_points || 0) / 100) + 1,
						experiencesAdded: row.experiences_added || 0,
						experiencesFixed: row.experiences_fixed || 0,
						experiencesVerified: row.experiences_verified || 0,
						experiencesSponsored: row.experiences_sponsored || 0,
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