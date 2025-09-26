import { Elysia, t } from "elysia";
import { settingsService } from "./service";

export const settingsRouter = new Elysia({
	prefix: "/settings",
	tags: ["Settings"],
})
	.get(
		"/",
		async ({ headers }) => {
			// TODO: Implement proper authentication
			const userId = "user-123";

			const settings = await settingsService.getUserSettings(userId);
			return settings;
		},
		{
			detail: {
				summary: "Get user settings",
				description: "Get the current user's settings and preferences",
			},
		},
	)
	.patch(
		"/",
		async ({ headers, body }) => {
			// TODO: Implement proper authentication
			const userId = "user-123";

			const updatedSettings = await settingsService.updateUserSettings(
				userId,
				body,
			);
			return updatedSettings;
		},
		{
			body: t.Object({
				notifications: t.Optional(
					t.Object({
						email: t.Optional(t.Boolean()),
						push: t.Optional(t.Boolean()),
						issueUpdates: t.Optional(t.Boolean()),
						weeklyReport: t.Optional(t.Boolean()),
					}),
				),
				privacy: t.Optional(
					t.Object({
						showProfile: t.Optional(t.Boolean()),
						showActivity: t.Optional(t.Boolean()),
						showStats: t.Optional(t.Boolean()),
					}),
				),
				display: t.Optional(
					t.Object({
						theme: t.Optional(
							t.Union([
								t.Literal("light"),
								t.Literal("dark"),
								t.Literal("system"),
							]),
						),
						language: t.Optional(t.String()),
						mapStyle: t.Optional(t.String()),
					}),
				),
			}),
			detail: {
				summary: "Update user settings",
				description: "Update the current user's settings and preferences",
			},
		},
	)
	.delete(
		"/account",
		async ({ headers, body }) => {
			// TODO: Implement proper authentication
			const userId = "user-123";

			if (!body.confirmPassword) {
				throw new Error("Password confirmation required");
			}

			const result = await settingsService.deleteAccount(
				userId,
				body.confirmPassword,
			);
			return result;
		},
		{
			body: t.Object({
				confirmPassword: t.String(),
			}),
			detail: {
				summary: "Delete user account",
				description: "Permanently delete user account and all associated data",
			},
		},
	);
