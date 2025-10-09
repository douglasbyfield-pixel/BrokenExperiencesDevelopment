import { env } from "@server/env";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client for server-side operations
// Use SERVICE_ROLE_KEY to verify user tokens (needed for getUser with token)
export const supabase = createClient(
	env.SUPABASE_URL || "",
	process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || "",
);

// Middleware to verify Supabase JWT token
export async function verifySupabaseToken(authHeader?: string): Promise<{
	id: string;
	email: string;
	name: string;
	image?: string;
	emailVerified: boolean;
} | null> {
	console.log(
		"🔒 verifySupabaseToken called with:",
		authHeader?.substring(0, 30),
	);

	if (!authHeader?.startsWith("Bearer ")) {
		console.log("🔒 No Bearer token found");
		return null;
	}

	const token = authHeader.substring(7);
	console.log("🔒 Extracted token (first 30 chars):", token.substring(0, 30));

	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		console.log("🔒 Supabase getUser result:", {
			hasUser: !!user,
			userId: user?.id,
			error: error?.message,
		});

		if (error || !user) {
			console.error("🔒 Token verification failed:", error);
			return null;
		}

		// Try to get the best available name for the user
		const userName =
			user.user_metadata?.full_name ||
			user.user_metadata?.name ||
			user.user_metadata?.display_name ||
			user.email?.split("@")[0] ||
			"Anonymous";

		console.log("🔒 User metadata:", {
			fullName: user.user_metadata?.full_name,
			name: user.user_metadata?.name,
			displayName: user.user_metadata?.display_name,
			avatarUrl: user.user_metadata?.avatar_url,
			finalName: userName,
		});

		return {
			id: user.id,
			email: user.email || "anonymous@local",
			name: userName,
			image: user.user_metadata?.avatar_url || user.user_metadata?.picture,
			emailVerified: !!user.email_confirmed_at,
		};
	} catch (error) {
		console.error("🔒 Error verifying token:", error);
		return null;
	}
}

// Extract user from Authorization header
export async function getCurrentUser(
	headers: Record<string, string | undefined>,
) {
	const authHeader = headers.authorization || headers.Authorization;
	return await verifySupabaseToken(authHeader);
}
