import { Elysia, t } from "elysia";
import { userService } from "./service";

export const userRouter = new Elysia({ prefix: "/user", tags: ["User"] })
	.get(
		"/profile",
		async ({ headers }) => {
			// TODO: Implement proper authentication
			// For now, we'll use a mock user ID
			const userId = "mock-user-id";

			const profile = await userService.getUserProfile(userId);
			return profile;
		},
		{
			detail: {
				summary: "Get user profile",
				description: "Get the current user's profile including roles",
			},
		},
	)
	.get(
		"/roles",
		async ({ headers }) => {
			// TODO: Implement proper authentication
			// For now, we'll use a mock user ID
			const userId = "mock-user-id";

			const roles = await userService.getUserRoles(userId);
			return roles;
		},
		{
			detail: {
				summary: "Get user roles",
				description: "Get the current user's roles",
			},
		},
	)
	.post(
		"/roles/:role",
		async ({ headers, params: { role } }) => {
			// TODO: Implement proper authentication
			// For now, we'll use a mock user ID
			const userId = "mock-user-id";

			if (!["reporter", "fixer", "sponsor"].includes(role)) {
				throw new Error("Invalid role");
			}

			const result = await userService.addUserRole(
				userId,
				role as "reporter" | "fixer" | "sponsor",
			);
			return result;
		},
		{
			params: t.Object({
				role: t.String(),
			}),
			detail: {
				summary: "Add user role",
				description: "Add a role to the current user",
			},
		},
	)
	.patch(
		"/profile",
		async ({ headers, body }) => {
			// TODO: Implement proper authentication
			const userId = "user-123";

			const updatedProfile = await userService.updateUserProfile(userId, body);
			return updatedProfile;
		},
		{
			body: t.Object({
				name: t.Optional(t.String()),
				bio: t.Optional(t.String()),
				location: t.Optional(t.String()),
				image: t.Optional(t.String()),
			}),
			detail: {
				summary: "Update user profile",
				description: "Update the current user's profile information",
			},
		},
	)
	.get(
		"/activity",
		async ({ headers, query }) => {
			// TODO: Implement proper authentication
			const userId = "user-123";

			const activity = await userService.getUserActivity(userId, query);
			return activity;
		},
		{
			query: t.Object({
				limit: t.Optional(t.Numeric()),
				offset: t.Optional(t.Numeric()),
			}),
			detail: {
				summary: "Get user activity",
				description: "Get the current user's activity timeline",
			},
		},
	)
	.post(
		"/upload-avatar",
		async ({ headers, body }) => {
			// TODO: Implement proper authentication and file upload
			const userId = "user-123";

			// For now, return a mock response
			return {
				url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
				message: "Avatar uploaded successfully",
			};
		},
		{
			detail: {
				summary: "Upload user avatar",
				description: "Upload a new avatar image for the current user",
			},
		},
	);
