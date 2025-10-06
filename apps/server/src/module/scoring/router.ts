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
				const userScore = await ScoringService.getUserScore(params.userId);
				
				set.status = 200;
				return {
					success: true,
					data: userScore,
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
				
				const formattedLeaderboard = await ScoringService.getLeaderboard(
					query.limit || 10,
					query.offset || 0
				);
				
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
				const formattedLeaderboard = await ScoringService.getCategoryLeaderboard(
					params.category,
					query.limit || 10,
					query.offset || 0
				);
				
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
				const rankData = await ScoringService.getUserRank(params.userId);
				
				set.status = 200;
				return {
					success: true,
					data: rankData,
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