export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";

// Type for push subscription
type PushSubscriptionPayload = {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
};

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

		// Get the subscription payload
		const subscription: PushSubscriptionPayload = await req.json();

		console.log("📱 Received push subscription:", {
			endpoint: subscription.endpoint.substring(0, 50) + "...",
			hasKeys: !!subscription.keys,
			hasP256dh: !!subscription.keys?.p256dh,
			hasAuth: !!subscription.keys?.auth,
		});

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

		console.log("✅ User authenticated:", user.id);

		// Check if subscription already exists for this user/endpoint combo
		const { data: existingSub } = await supabaseAdmin
			.from("push_subscriptions")
			.select("id")
			.eq("user_id", user.id)
			.eq("endpoint", subscription.endpoint)
			.single();

		if (existingSub) {
			console.log("📱 Subscription already exists, updating...");

			// Update existing subscription
			const { error: updateError } = await supabaseAdmin
				.from("push_subscriptions")
				.update({
					p256dh: subscription.keys.p256dh,
					auth: subscription.keys.auth,
					updated_at: new Date().toISOString(),
				})
				.eq("id", existingSub.id);

			if (updateError) {
				console.error("❌ Failed to update subscription:", updateError);
				return new Response(
					JSON.stringify({ error: "Failed to update subscription" }),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			console.log("✅ Subscription updated successfully");
		} else {
			console.log("📱 Creating new subscription...");

			// Create new subscription
			const { error: insertError } = await supabaseAdmin
				.from("push_subscriptions")
				.insert({
					user_id: user.id,
					endpoint: subscription.endpoint,
					p256dh: subscription.keys.p256dh,
					auth: subscription.keys.auth,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				});

			if (insertError) {
				console.error("❌ Failed to save subscription:", insertError);
				return new Response(
					JSON.stringify({ error: "Failed to save subscription" }),
					{
						status: 500,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			console.log("✅ Subscription saved successfully");
		}

		// Also enable notification preferences in user settings
		const { error: settingsError } = await supabaseAdmin
			.from("user_settings")
			.upsert({
				user_id: user.id,
				notifications_enabled: true,
				push_notifications: true,
				updated_at: new Date().toISOString(),
			});

		if (settingsError) {
			console.warn("⚠️ Failed to update notification settings:", settingsError);
			// Don't fail the request for this
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: "Push subscription saved successfully",
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("❌ Error in subscribe endpoint:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
