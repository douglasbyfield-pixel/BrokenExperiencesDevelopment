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
			// Return settings in the format the frontend expects
			return {
				display: {
					theme: "light",
					mapStyle: "streets",
					language: "en",
				},
				notifications: {
					email: true,
					push: false,
					experienceUpdates: true,
					communityUpdates: false,
					marketing: false,
				},
				privacy: {
					publicProfile: true,
					showLocation: true,
					showActivity: false,
				},
			};
		},
		{
			detail: {
				summary: "Get user settings",
				description: "Returns user settings and preferences.",
			},
		},
	);