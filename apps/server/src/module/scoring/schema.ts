import { z } from "zod";

export const awardPointsSchema = z.object({
	activityType: z.enum(["add_experience", "fix_experience", "verify_experience", "sponsor_experience"]),
	experienceId: z.string().uuid().optional(),
});

export const getUserScoreSchema = z.object({
	userId: z.string().uuid(),
});

export const getLeaderboardSchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(10),
	offset: z.coerce.number().min(0).default(0),
});

export type AwardPointsInput = z.infer<typeof awardPointsSchema>;
export type GetUserScoreInput = z.infer<typeof getUserScoreSchema>;
export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>;
