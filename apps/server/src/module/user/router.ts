import { Elysia, t } from "elysia";
import { userService } from "./service";

export const userRouter = new Elysia({ prefix: "/user", tags: ["User"] })
	.get("/profile", async ({ headers }) => {
		// TODO: Implement proper authentication
		// For now, we'll use a mock user ID
		const userId = "mock-user-id";
		
		const profile = await userService.getUserProfile(userId);
		return profile;
	}, {
		detail: {
			summary: "Get user profile",
			description: "Get the current user's profile including roles"
		}
	})
	.get("/roles", async ({ headers }) => {
		// TODO: Implement proper authentication
		// For now, we'll use a mock user ID
		const userId = "mock-user-id";
		
		const roles = await userService.getUserRoles(userId);
		return roles;
	}, {
		detail: {
			summary: "Get user roles",
			description: "Get the current user's roles"
		}
	})
	.post("/roles/:role", async ({ headers, params: { role } }) => {
		// TODO: Implement proper authentication
		// For now, we'll use a mock user ID
		const userId = "mock-user-id";
		
		if (!["reporter", "fixer", "sponsor"].includes(role)) {
			throw new Error("Invalid role");
		}
		
		const result = await userService.addUserRole(userId, role as "reporter" | "fixer" | "sponsor");
		return result;
	}, {
		params: t.Object({
			role: t.String()
		}),
		detail: {
			summary: "Add user role",
			description: "Add a role to the current user"
		}
	});