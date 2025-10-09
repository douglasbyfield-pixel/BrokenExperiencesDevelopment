export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
function getSupabaseAdmin() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
}

// Initialize regular Supabase client
function getSupabaseClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}

export async function POST(req: Request) {
	try {
		const supabase = getSupabaseClient();
		const supabaseAdmin = getSupabaseAdmin();

		// Get the endpoint to unsubscribe
		const { endpoint } = await req.json();

		if (!endpoint) {
			return new Response(JSON.stringify({ error: "Endpoint is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		console.log("🗑️ Unsubscribing endpoint:", endpoint.substring(0, 50) + "...");

		// Get the current user from the authorization header
		const authHeader = req.headers.get("authorization");

		if (!authHeader) {
			console.error("❌ No authorization header found");
			return new Response(JSON.stringify({ error: "Not authenticated" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Extract the JWT token from the authorization header
		const token = authHeader.replace("Bearer ", "");
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser(token);

		if (userError || !user) {
			console.error("❌ Failed to get user:", userError);
			return new Response(JSON.stringify({ error: "Invalid session" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		console.log("✅ User authenticated for unsubscribe:", user.id);

		// Remove the subscription from the database
		const { data: deletedSubscriptions, error: deleteError } =
			await supabaseAdmin
				.from("push_subscriptions")
				.delete()
				.eq("user_id", user.id)
				.eq("endpoint", endpoint)
				.select();

		if (deleteError) {
			console.error("❌ Failed to delete subscription:", deleteError);
			return new Response(
				JSON.stringify({ error: "Failed to remove subscription" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (deletedSubscriptions && deletedSubscriptions.length > 0) {
			console.log("✅ Successfully removed subscription from database");
		} else {
			console.log(
				"⚠️ No subscription found to remove (already removed or non-existent)",
			);
		}

		// Also disable notification preferences in user settings
		const { error: settingsError } = await supabaseAdmin
			.from("user_settings")
			.upsert({
				user_id: user.id,
				notifications_enabled: false,
				push_notifications: false,
				updated_at: new Date().toISOString(),
			});

		if (settingsError) {
			console.warn("⚠️ Failed to update notification settings:", settingsError);
			// Don't fail the request for this
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: "Push subscription removed successfully",
				removed: deletedSubscriptions?.length || 0,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("❌ Error in unsubscribe endpoint:", error);
		return new Response(
			JSON.stringify({
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
