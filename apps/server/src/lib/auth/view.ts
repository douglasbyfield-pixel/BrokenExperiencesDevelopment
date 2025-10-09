import Elysia from "elysia";
import { verifySupabaseToken } from "./supabase";

// Create Supabase auth context
export const supabaseAuth = new Elysia({ name: "supabase-auth" }).derive(
	async ({ request }) => {
		const authHeader =
			request.headers.get("authorization") ||
			request.headers.get("Authorization");

		console.log(
			"🔍 Auth middleware - authorization header:",
			authHeader?.substring(0, 30),
		);

		const user = await verifySupabaseToken(authHeader || undefined);
		console.log(
			"🔍 Auth middleware - got user:",
			user ? { id: user.id, email: user.email } : null,
		);

		return {
			user,
			isAuthenticated: !!user,
		};
	},
);

// Protected route decorator that requires authentication
export const supabaseProtected = new Elysia({ name: "supabase-protected" })
	.use(supabaseAuth)
	.onBeforeHandle((ctx: any) => {
		if (!ctx.user) {
			ctx.set.status = 401;
			return {
				error: "Unauthorized",
				message: "Authentication required",
			};
		}
	});

// Session type for compatibility with existing code
export interface SupabaseSession {
	userId: string;
	user: {
		id: string;
		email: string;
		name: string;
		emailVerified: boolean;
	};
}

// Transform user to session format for backwards compatibility
export const supabaseSession = new Elysia({ name: "supabase-session" })
	.use(supabaseAuth)
	.derive((ctx: any) => ({
		session: ctx.user
			? ({
					userId: ctx.user.id,
					user: ctx.user,
				} as SupabaseSession)
			: null,
	}));

export const betterAuthView = supabaseSession;
