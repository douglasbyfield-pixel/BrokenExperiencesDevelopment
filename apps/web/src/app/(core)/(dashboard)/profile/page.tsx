"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { BackButton } from "@web/components/ui/back-button";
import { Card, CardContent } from "@web/components/ui/card";
import { useAuth } from "@web/components/auth-provider";
import { eden } from "@web/lib/eden";
import { getInitials } from "@web/lib/utils";
import { 
	Calendar, 
	CheckCircle, 
	LogOut, 
	Settings,
	Bell,
	BellOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
	const router = useRouter();
	const { user, signOut, isLoading } = useAuth();
	const [userStats, setUserStats] = useState<any>(null);
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [notificationStatus, setNotificationStatus] = useState<'default' | 'denied' | 'granted'>('default');

	useEffect(() => {
		// Check notification permission status
		if ('Notification' in window) {
			setNotificationStatus(Notification.permission);
		}

		// Check if notifications are enabled in localStorage
		const notifEnabled = localStorage.getItem('notifications-enabled') === 'true';
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
					// Fetch all experiences and filter by user email since backend auth migration is pending
					const allExperiences = await eden.experience.get({ $query: {} });
					
					if (allExperiences.data) {
						// Filter experiences by user email
						const filteredUserExperiences = allExperiences.data.filter(
							exp => exp.reportedBy?.email === user.email
						);
						
						// Calculate real stats from user's experiences
						const totalReports = filteredUserExperiences.length;
						const resolvedReports = filteredUserExperiences.filter(exp => exp.status === 'resolved').length;
						const inProgressReports = filteredUserExperiences.filter(exp => exp.status === 'in_progress').length;
						const pendingReports = filteredUserExperiences.filter(exp => exp.status === 'pending').length;
						
						// Calculate impact score based on the backend formula
						const impactScore = totalReports * 10 + resolvedReports * 25;
						
						setUserStats({
							totalReports,
							resolvedReports,
							inProgressReports: inProgressReports + pendingReports,
							impactScore
						});
					} else {
						// Fallback to zero stats if no data
						setUserStats({
							totalReports: 0,
							resolvedReports: 0,
							inProgressReports: 0,
							impactScore: 0
						});
					}
				} catch (error) {
					console.error("Failed to fetch user stats:", error);
					// Fallback to zero stats on error
					setUserStats({
						totalReports: 0,
						resolvedReports: 0,
						inProgressReports: 0,
						impactScore: 0
					});
				}
			};

			fetchUserStats();
		}
	}, [user, isLoading, router]);

	const handleSignOut = async () => {
		await signOut();
	};

	const requestNotificationPermission = async () => {
		if (!('Notification' in window)) {
			alert('This browser does not support notifications');
			return;
		}

		try {
			const permission = await Notification.requestPermission();
			setNotificationStatus(permission);
			
			if (permission === 'granted') {
				setNotificationsEnabled(true);
				localStorage.setItem('notifications-enabled', 'true');
				
				// Subscribe to push notifications
				if ('serviceWorker' in navigator) {
					const registration = await navigator.serviceWorker.ready;
					
					if ('pushManager' in registration) {
						try {
							const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
							const subscription = await registration.pushManager.subscribe({
								userVisibleOnly: true,
								applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined
							});
							
							// Send subscription to server
							await fetch('/api/notifications/subscribe', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(subscription),
							});
							
							// Show test notification
							new Notification('Notifications Enabled!', {
								body: 'You will now receive updates about your reported issues.',
								icon: '/images/logo.png'
							});
						} catch (pushError) {
							console.error('Push subscription failed:', pushError);
						}
					}
				}
			} else {
				setNotificationsEnabled(false);
				localStorage.setItem('notifications-enabled', 'false');
			}
		} catch (error) {
			console.error('Error requesting notification permission:', error);
		}
	};

	const disableNotifications = () => {
		setNotificationsEnabled(false);
		localStorage.setItem('notifications-enabled', 'false');
		
		// Unsubscribe from push notifications
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then(registration => {
				if ('pushManager' in registration) {
					registration.pushManager.getSubscription().then(subscription => {
						if (subscription) {
							subscription.unsubscribe();
						}
					});
				}
			});
		}
	};

	// Helper function to convert VAPID key
	function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, '+')
			.replace(/_/g, '/');
		
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
			<div className="border-b border-gray-100 px-6 py-4">
				<div className="flex items-center space-x-3">
					<BackButton fallbackUrl="/home" />
					<h1 className="text-lg font-medium text-gray-900">Profile</h1>
				</div>
			</div>

			<div className="max-w-2xl mx-auto p-6 space-y-8">
				{/* Profile Section */}
				<div className="flex items-start space-x-4">
					<Avatar className="h-20 w-20">
						<AvatarImage 
							src={user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined} 
							alt={user.user_metadata?.name || user.email} 
						/>
						<AvatarFallback className="bg-gray-100 text-gray-700 text-lg">
							{getInitials(user.user_metadata?.name || user.email || 'User')}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<div className="flex items-center space-x-2 mb-1">
							<h2 className="text-xl font-medium text-gray-900 truncate">
								{user.user_metadata?.name || user.email}
							</h2>
							{user.email_confirmed_at && (
								<CheckCircle className="h-4 w-4 text-gray-400" />
							)}
						</div>
						<p className="text-gray-500 text-sm truncate">
							{user.email}
						</p>
						<div className="flex items-center text-gray-400 text-sm mt-2">
							<Calendar className="h-3 w-3 mr-1" />
							Member since {new Date(user.created_at).toLocaleDateString()}
						</div>
					</div>
				</div>

				{/* Stats */}
				{userStats && (
					<div className="grid grid-cols-3 gap-6">
						<div className="text-center">
							<div className="text-2xl font-medium text-gray-900">{userStats.totalReports}</div>
							<p className="text-sm text-gray-500 mt-1">Reports</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-medium text-gray-900">{userStats.resolvedReports}</div>
							<p className="text-sm text-gray-500 mt-1">Resolved</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-medium text-gray-900">{userStats.impactScore}</div>
							<p className="text-sm text-gray-500 mt-1">Impact Score</p>
						</div>
					</div>
				)}

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
									<h3 className="font-medium text-gray-900">Push Notifications</h3>
									<p className="text-sm text-gray-500">Get notified about your reports</p>
								</div>
							</div>
							<Button
								variant={notificationsEnabled ? "outline" : "default"}
								size="sm"
								onClick={notificationsEnabled ? disableNotifications : requestNotificationPermission}
								disabled={notificationStatus === 'denied'}
							>
								{notificationStatus === 'denied' ? 'Blocked' :
								 notificationsEnabled ? 'Disable' : 'Enable'}
							</Button>
						</div>
						{notificationStatus === 'denied' && (
							<p className="text-xs text-gray-400 mt-2">
								Notifications blocked. Enable in browser settings to receive updates.
							</p>
						)}
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="space-y-3">
					<Button
						variant="outline"
						className="w-full justify-start text-gray-700 border-gray-200"
						onClick={() => router.push("/settings")}
					>
						<Settings className="h-4 w-4 mr-3" />
						Settings
					</Button>
					<Button
						variant="outline"
						className="w-full justify-start text-red-600 border-gray-200 hover:bg-red-50"
						onClick={handleSignOut}
					>
						<LogOut className="h-4 w-4 mr-3" />
						Sign Out
					</Button>
				</div>
			</div>
		</div>
	);
}