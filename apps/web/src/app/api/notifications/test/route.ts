export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Initialize Supabase admin client
function getSupabaseAdmin() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
}

// Configure web push
function configureWebpush() {
	webpush.setVapidDetails(
		"mailto:dev@brokenexperiences.com",
		process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
		process.env.VAPID_PRIVATE_KEY!,
	);
}

export async function POST(req: Request) {
	try {
		// Simple protection
		if (req.headers.get("x-admin-token") !== process.env.ADMIN_TOKEN) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const { testType, userId, message } = await req.json();

		const supabaseAdmin = getSupabaseAdmin();
		configureWebpush();

		console.log("🧪 Running notification test:", testType);

		switch (testType) {
			case "list_subscriptions": {
				// List all push subscriptions
				const { data: subscriptions, error } = await supabaseAdmin
					.from("push_subscriptions")
					.select("*");

				if (error) throw error;

				return new Response(
					JSON.stringify({
						success: true,
						subscriptions: subscriptions || [],
						count: subscriptions?.length || 0,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			case "test_single_notification": {
				if (!userId) {
					return new Response(
						JSON.stringify({
							error: "userId required for single notification test",
						}),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Get user's push subscriptions
				const { data: subscriptions, error } = await supabaseAdmin
					.from("push_subscriptions")
					.select("*")
					.eq("user_id", userId);

				if (error) throw error;

				if (!subscriptions || subscriptions.length === 0) {
					return new Response(
						JSON.stringify({
							error: "No push subscriptions found for user",
							userId,
						}),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Send test notification
				const payload = JSON.stringify({
					title: "🧪 Test Notification",
					body:
						message || "This is a test notification from Broken Experiences!",
					icon: "/images/logo.png",
					badge: "/images/logo.png",
					tag: "test-notification",
					requireInteraction: true,
					actions: [
						{
							action: "view",
							title: "👀 View App",
						},
					],
					data: {
						type: "test",
						url: "/home",
						timestamp: Date.now(),
					},
				});

				let sent = 0;
				const errors: string[] = [];

				for (const subscription of subscriptions) {
					try {
						await webpush.sendNotification(
							{
								endpoint: subscription.endpoint,
								keys: {
									p256dh: subscription.p256dh,
									auth: subscription.auth,
								},
							},
							payload,
						);
						sent++;
						console.log(
							`✅ Test notification sent to subscription: ${subscription.id}`,
						);
					} catch (error: any) {
						console.error(
							"❌ Failed to send test notification:",
							error?.message,
						);
						errors.push(`Subscription ${subscription.id}: ${error?.message}`);

						// Clean up invalid subscriptions
						if (error?.statusCode === 404 || error?.statusCode === 410) {
							await supabaseAdmin
								.from("push_subscriptions")
								.delete()
								.eq("id", subscription.id);
							console.log(
								`🧹 Cleaned up invalid subscription: ${subscription.id}`,
							);
						}
					}
				}

				return new Response(
					JSON.stringify({
						success: true,
						message: "Test notification sent",
						sent,
						totalSubscriptions: subscriptions.length,
						errors: errors.length > 0 ? errors : undefined,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			case "test_proximity": {
				// Simple proximity test without external calls
				return new Response(
					JSON.stringify({
						success: true,
						message: "Proximity test functionality is available",
						note: "Use the proximity endpoint directly with a real experience ID",
						endpoint: "/api/notifications/proximity",
						examplePayload: {
							experienceId: "real-experience-id",
							proximityRadius: 5
						}
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			case "check_environment": {
				// Check if all required environment variables are set
				const envCheck = {
					NEXT_PUBLIC_VAPID_PUBLIC_KEY:
						!!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
					VAPID_PRIVATE_KEY: !!process.env.VAPID_PRIVATE_KEY,
					ADMIN_TOKEN: !!process.env.ADMIN_TOKEN,
					NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
					SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
				};

				const allSet = Object.values(envCheck).every(Boolean);

				return new Response(
					JSON.stringify({
						success: allSet,
						environment: envCheck,
						message: allSet
							? "All environment variables are set"
							: "Missing environment variables",
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			default: {
				return new Response(
					JSON.stringify({
						error: "Invalid test type",
						availableTests: [
							"list_subscriptions",
							"test_single_notification",
							"test_proximity",
							"check_environment",
						],
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
		}
	} catch (error) {
		console.error("❌ Error in notification test endpoint:", error);
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
