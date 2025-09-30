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
		async ({ session }) => {
			const result = await getUserStats(session.userId);
			return result;
		},
		{
			auth: true,
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
