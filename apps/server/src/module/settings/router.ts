import { betterAuthView } from "@server/lib/auth/view";
import Elysia from "elysia";

export const settingsRouter = new Elysia({
	prefix: "/settings",
	tags: ["Settings"],
})
	.use(betterAuthView)
	.get(
		"/",
		async () => {
			return {
				status: "ok",
				message: "Settings endpoint",
				data: {
					theme: "light",
					notifications: true
				}
			};
		},
		{
			detail: {
				summary: "Get user settings",
				description: "Returns user settings and preferences.",
			},
		},
	);