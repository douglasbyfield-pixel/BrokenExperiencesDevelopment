"use client";

import { useAuth } from "@web/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { BackButton } from "@web/components/ui/back-button";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { eden } from "@web/lib/eden";
import { createClient } from "@web/lib/supabase/client";
import { getInitials } from "@web/lib/utils";
import {
	Bell,
	BellOff,
	Calendar,
	CheckCircle,
	LogOut,
	Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
	const router = useRouter();
	const { user, signOut, isLoading } = useAuth();
	const [userStats, setUserStats] = useState<any>(null);
	const [loadingStats, setLoadingStats] = useState(true);
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [notificationStatus, setNotificationStatus] = useState<
		"default" | "denied" | "granted"
	>("default");

	useEffect(() => {
		// Check notification permission status
		if ("Notification" in window) {
			setNotificationStatus(Notification.permission);
		}

		// Check if notifications are enabled in localStorage
		const notifEnabled =
			localStorage.getItem("notifications-enabled") === "true";
		setNotificationsEnabled(notifEnabled);
	}, []);

	useEffect(() => {
		// Redirect to login if not authenticated
		if (!isLoading && !user) {
			router.push("/login");
			return;
		}

		// Fetch user stats if user is authenticated
		if (user) {
			const fetchUserStats = async () => {
				try {
					console.log("🚀 Fetching user stats for profile...");
					
					const supabase = createClient();
					const {
						data: { session },
					} = await supabase.auth.getSession();

					if (!session?.user?.id) {
						setLoadingStats(false);
						return;
					}

					const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
					
					// Fetch both data sources in parallel for accuracy
					const [experienceStatsResult, scoringStatsResult] = await Promise.allSettled([
						// Get actual report counts from experience table
						eden.stats.user.get(),
						// Get impact score from scoring system
						fetch(`${apiUrl}/scoring/user/${session.user.id}`, {
							headers: {
								Authorization: `Bearer ${session.access_token}`,
								"Content-Type": "application/json",
							},
						})
					]);

					let experienceStats = { totalReports: 0, resolvedReports: 0, impactScore: 0 };
					let impactScore = 0;

					// Process experience stats (actual reports/resolved counts)
					if (experienceStatsResult.status === 'fulfilled' && experienceStatsResult.value.data) {
						experienceStats = experienceStatsResult.value.data;
						console.log("✅ Experience stats loaded:", experienceStats);
					}

					// Process scoring stats (impact score from leaderboard system)
					if (scoringStatsResult.status === 'fulfilled') {
						const response = scoringStatsResult.value;
						if (response.ok) {
							const result = await response.json();
							if (result.success && result.data) {
								impactScore = result.data.totalPoints || 0;
								console.log("✅ Scoring data loaded - Impact Score:", impactScore);
							}
						}
					}

					// Combine the data: use experience stats for reports/resolved, scoring for impact
					setUserStats({
						totalReports: experienceStats.totalReports || 0,
						resolvedReports: experienceStats.resolvedReports || 0,
						impactScore: impactScore || experienceStats.impactScore || 0, // Prefer scoring system impact score
					});

				} catch (error) {
					console.error("Failed to fetch user stats:", error);
					// Fallback to zero stats on error
					setUserStats({
						totalReports: 0,
						resolvedReports: 0,
						impactScore: 0,
					});
				} finally {
					setLoadingStats(false);
				}
			};

			fetchUserStats();
		}
	}, [user, isLoading, router]);

	const handleSignOut = async () => {
		await signOut();
	};

	const requestNotificationPermission = async () => {
		if (!("Notification" in window)) {
			alert("This browser does not support notifications");
			return;
		}

		try {
			let permission = Notification.permission;

			// Only request permission if not already granted
			if (permission === "default") {
				permission = await Notification.requestPermission();
			}

			setNotificationStatus(permission);

			if (permission === "granted") {
				setNotificationsEnabled(true);
				localStorage.setItem("notifications-enabled", "true");

				// Subscribe to push notifications
				if ("serviceWorker" in navigator) {
					const registration = await navigator.serviceWorker.ready;

					if ("pushManager" in registration) {
						try {
							// First, unsubscribe any existing subscription
							const existingSubscription =
								await registration.pushManager.getSubscription();
							if (existingSubscription) {
								console.log(
									"🔄 Removing existing subscription before creating new one",
								);
								await existingSubscription.unsubscribe();
							}

							// Create new subscription
							const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
							const subscription = await registration.pushManager.subscribe({
								userVisibleOnly: true,
								applicationServerKey: vapidKey
									? urlBase64ToUint8Array(vapidKey)
									: undefined,
							});

							console.log("✅ Created new push subscription");

							// Send subscription to server
							const supabase = createClient();
							const {
								data: { session },
							} = await supabase.auth.getSession();

							const response = await fetch("/api/notifications/subscribe", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${session?.access_token}`,
								},
								body: JSON.stringify(subscription),
							});

							if (response.ok) {
								console.log("✅ Subscription saved to server");
								// Show test notification
								new Notification("Notifications Enabled!", {
									body: "You will now receive updates about your reported issues.",
									icon: "/images/logo.png",
								});
							} else {
								console.error(
									"❌ Failed to save subscription to server:",
									response.status,
								);
								throw new Error(`Server error: ${response.status}`);
							}
						} catch (pushError) {
							console.error("❌ Push subscription failed:", pushError);
							setNotificationsEnabled(false);
							localStorage.setItem("notifications-enabled", "false");
							alert("Failed to enable push notifications. Please try again.");
						}
					}
				}
			} else {
				setNotificationsEnabled(false);
				localStorage.setItem("notifications-enabled", "false");
			}
		} catch (error) {
			console.error("❌ Error requesting notification permission:", error);
			setNotificationsEnabled(false);
			localStorage.setItem("notifications-enabled", "false");
		}
	};

	const disableNotifications = async () => {
		setNotificationsEnabled(false);
		localStorage.setItem("notifications-enabled", "false");

		// Unsubscribe from push notifications
		if ("serviceWorker" in navigator) {
			try {
				const registration = await navigator.serviceWorker.ready;
				if ("pushManager" in registration) {
					const subscription = await registration.pushManager.getSubscription();
					if (subscription) {
						// Unsubscribe from browser
						await subscription.unsubscribe();
						console.log("✅ Unsubscribed from browser push notifications");

						// Notify server to remove subscription from database
						const supabase = createClient();
						const {
							data: { session },
						} = await supabase.auth.getSession();

						if (session) {
							await fetch("/api/notifications/unsubscribe", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${session.access_token}`,
								},
								body: JSON.stringify({ endpoint: subscription.endpoint }),
							});
							console.log("✅ Removed subscription from server");
						}
					}
				}
			} catch (error) {
				console.error("❌ Error disabling notifications:", error);
			}
		}
	};

	// Helper function to convert VAPID key
	function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray.buffer;
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-600">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-600">Please sign in to view your profile</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<div className="border-gray-100 border-b px-6 py-4">
				<div className="flex items-center space-x-3">
					<BackButton fallbackUrl="/home" />
					<h1 className="font-medium text-gray-900 text-lg">Profile</h1>
				</div>
			</div>

			<div className="mx-auto max-w-2xl space-y-8 p-6">
				{/* Profile Section */}
				<div className="flex items-start space-x-4">
					<Avatar className="h-20 w-20">
						<AvatarImage
							src={
								user.user_metadata?.avatar_url ||
								user.user_metadata?.picture ||
								undefined
							}
							alt={user.user_metadata?.name || user.email}
						/>
						<AvatarFallback className="bg-gray-100 text-gray-700 text-lg">
							{getInitials(user.user_metadata?.name || user.email || "User")}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center space-x-2">
							<h2 className="truncate font-medium text-gray-900 text-xl">
								{user.user_metadata?.name || user.email}
							</h2>
							{user.email_confirmed_at && (
								<CheckCircle className="h-4 w-4 text-gray-400" />
							)}
						</div>
						<p className="truncate text-gray-500 text-sm">{user.email}</p>
						<div className="mt-2 flex items-center text-gray-400 text-sm">
							<Calendar className="mr-1 h-3 w-3" />
							Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
								year: 'numeric', 
								month: 'long', 
								day: 'numeric' 
							})}
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-6">
					<div className="text-center">
						<div className="font-medium text-2xl text-gray-900">
							{loadingStats ? (
								<div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-200" />
							) : (
								userStats?.totalReports || 0
							)}
						</div>
						<p className="mt-1 text-gray-500 text-sm">Reports</p>
					</div>
					<div className="text-center">
						<div className="font-medium text-2xl text-gray-900">
							{loadingStats ? (
								<div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-200" />
							) : (
								userStats?.resolvedReports || 0
							)}
						</div>
						<p className="mt-1 text-gray-500 text-sm">Resolved</p>
					</div>
					<div className="text-center">
						<div className="font-medium text-2xl text-gray-900">
							{loadingStats ? (
								<div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-200" />
							) : (
								userStats?.impactScore || 0
							)}
						</div>
						<p className="mt-1 text-gray-500 text-sm">Impact Score</p>
					</div>
				</div>

				{/* Notifications */}
				<Card className="border-gray-200">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								{notificationsEnabled ? (
									<Bell className="h-5 w-5 text-gray-600" />
								) : (
									<BellOff className="h-5 w-5 text-gray-400" />
								)}
								<div>
									<h3 className="font-medium text-gray-900">
										Push Notifications
									</h3>
									<p className="text-gray-500 text-sm">
										Get notified about your reports
									</p>
								</div>
							</div>
							<Button
								variant={notificationsEnabled ? "outline" : "default"}
								size="sm"
								onClick={
									notificationsEnabled
										? disableNotifications
										: requestNotificationPermission
								}
								disabled={notificationStatus === "denied"}
							>
								{notificationStatus === "denied"
									? "Blocked"
									: notificationsEnabled
										? "Disable"
										: "Enable"}
							</Button>
						</div>
						{notificationStatus === "denied" && (
							<p className="mt-2 text-gray-400 text-xs">
								Notifications blocked. Enable in browser settings to receive
								updates.
							</p>
						)}
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="space-y-3">
					<Button
						variant="outline"
						className="w-full justify-start border-gray-200 text-gray-700"
						onClick={() => router.push("/settings")}
					>
						<Settings className="mr-3 h-4 w-4" />
						Settings
					</Button>
					<Button
						variant="outline"
						className="w-full justify-start border-gray-200 text-red-600 hover:bg-red-50"
						onClick={handleSignOut}
					>
						<LogOut className="mr-3 h-4 w-4" />
						Sign Out
					</Button>
				</div>
			</div>
		</div>
	);
}
