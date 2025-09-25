import { Elysia, t } from "elysia";
import { authService } from "./service";

export const authRouter = new Elysia({ prefix: "/auth", tags: ["Authentication"] })
	.post("/register", async ({ body }) => {
		const user = await authService.register(body);
		return user;
	}, {
		body: t.Object({
			email: t.String({ format: "email" }),
			password: t.String({ minLength: 8 }),
			name: t.String()
		}),
		detail: {
			summary: "Register new user",
			description: "Create a new user account"
		}
	})
	.post("/login", async ({ body, set, cookie }) => {
		const result = await authService.login(body.email, body.password);
		
		if (!result) {
			set.status = 401;
			return { error: "Invalid credentials" };
		}
		
		// Set session cookie
		cookie.session.value = result.session.id;
		cookie.session.httpOnly = true;
		cookie.session.path = "/";
		
		return {
			user: result.user,
			session: result.session
		};
	}, {
		body: t.Object({
			email: t.String({ format: "email" }),
			password: t.String()
		}),
		detail: {
			summary: "Login user",
			description: "Authenticate user and create session"
		}
	})
	.post("/logout", async ({ cookie }) => {
		// Clear session cookie
		cookie.session.value = "";
		cookie.session.path = "/";
		
		return { message: "Logged out successfully" };
	}, {
		detail: {
			summary: "Logout user",
			description: "Clear user session"
		}
	})
	.get("/me", async ({ headers, cookie }) => {
		// Get session from cookie or header
		const sessionId = cookie.session.value || headers.authorization?.replace("Bearer ", "");
		
		if (!sessionId) {
			return null;
		}
		
		const user = await authService.getUserBySession(sessionId);
		return user;
	}, {
		detail: {
			summary: "Get current user",
			description: "Get the currently authenticated user"
		}
	})
	.post("/forgot-password", async ({ body }) => {
		await authService.requestPasswordReset(body.email);
		return { message: "Password reset email sent" };
	}, {
		body: t.Object({
			email: t.String({ format: "email" })
		}),
		detail: {
			summary: "Request password reset",
			description: "Send password reset email"
		}
	})
	.post("/reset-password", async ({ body }) => {
		const success = await authService.resetPassword(body.token, body.password);
		
		if (!success) {
			return { error: "Invalid or expired token" };
		}
		
		return { message: "Password reset successfully" };
	}, {
		body: t.Object({
			token: t.String(),
			password: t.String({ minLength: 8 })
		}),
		detail: {
			summary: "Reset password",
			description: "Reset password with token from email"
		}
	});