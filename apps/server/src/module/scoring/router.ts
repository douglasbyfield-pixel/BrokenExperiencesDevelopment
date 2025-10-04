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
				// Get leaderboard from activity points table
				const { db } = await import("@server/db");
				const { desc } = await import("drizzle-orm");
				const { activityPoints } = await import("@server/db/schema");
				
				const leaderboard = await db.query.activityPoints.findMany({
					orderBy: desc(activityPoints.totalPoints),
					limit: query.limit,
					offset: query.offset,
				});
				
				set.status = 200;
				return {
					success: true,
					data: leaderboard,
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
	);