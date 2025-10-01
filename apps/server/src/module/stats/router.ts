import { betterAuthView } from "@server/lib/auth/view";
import Elysia from "elysia";
import { getStats, getTrendingCategories, getUserStats } from "./service";

export const statsRouter = new Elysia({
	prefix: "/stats",
	tags: ["Stats"],
})
	.use(betterAuthView)
	.get(
		"/",
		async () => {
			const result = await getStats();
			return result;
		},
		{
			detail: {
				summary: "Get stats",
				description: "Returns platform stats.",
			},
		},
	)
	.get(
		"/user",
		async (ctx: any) => {
			const result = await getUserStats(ctx.session?.userId || "anonymous");
			return result;
		},
		{
			detail: {
				summary: "Get user stats",
				description: "Returns stats for the authenticated user.",
			},
		},
	)
	.get(
		"/trending",
		async () => {
			const result = await getTrendingCategories();
			return result;
		},
		{
			detail: {
				summary: "Get trending categories",
				description: "Returns the most popular categories by report count.",
			},
		},
	);
