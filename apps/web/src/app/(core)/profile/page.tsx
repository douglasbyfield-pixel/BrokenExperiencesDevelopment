"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { authClient } from "@web/lib/auth-client";
import { eden } from "@web/lib/eden";
import { getInitials } from "@web/lib/utils";
import { Calendar, LogOut, Mail, MapPin, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [userStats, setUserStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				// Get current session
				const session = await authClient.getSession();
				if (!session || !("user" in session)) {
					router.push("/login");
					return;
				}

				setUser(session.user);

				// Fetch user stats
				try {
					const stats = await eden.stats.user.get({
						$query: {},
						$headers: {}
					});
					setUserStats(stats.data);
				} catch (error) {
					console.error("Failed to fetch user stats:", error);
				}
			} catch (error) {
				console.error("Failed to fetch user data:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [router]);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-black">Loading profile...</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-black">Please sign in to view your profile</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="container mx-auto max-w-4xl px-4 py-8">
				{/* Profile Header */}
				<Card className="mb-8">
					<CardContent className="p-8">
						<div className="flex flex-col gap-6 lg:flex-row lg:items-center">
							{/* Avatar */}
							<div className="flex justify-center lg:justify-start">
								<Avatar className="h-24 w-24 border-2 border-gray-200">
									<AvatarImage src={user.image || undefined} alt={user.name} />
									<AvatarFallback className="bg-gray-200 text-gray-700 text-2xl">
										{getInitials(user.name)}
									</AvatarFallback>
								</Avatar>
							</div>

							{/* User Information */}
							<div className="flex-1 text-center lg:text-left">
								<h1 className="mb-2 font-bold text-3xl text-black">{user.name}</h1>
								<div className="space-y-2 text-gray-600">
									<div className="flex items-center justify-center gap-2 lg:justify-start">
										<Mail className="h-4 w-4" />
										<span>{user.email}</span>
									</div>
									<div className="flex items-center justify-center gap-2 lg:justify-start">
										<Calendar className="h-4 w-4" />
										<span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
									</div>
									{user.emailVerified && (
										<div className="flex items-center justify-center gap-2 lg:justify-start">
											<svg viewBox="0 0 22 22" className="h-4 w-4 text-blue-500">
												<path
													fill="currentColor"
													d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
												/>
											</svg>
											<span className="text-green-600">Verified Account</span>
										</div>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
								<Button
									variant="outline"
									onClick={() => router.push("/settings")}
									className="border-gray-300"
								>
									Settings
								</Button>
								<Button
									variant="outline"
									onClick={handleSignOut}
									className="border-red-200 text-red-600 hover:bg-red-50"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sign Out
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* User Statistics */}
				{userStats && (
					<div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
						<Card>
							<CardContent className="p-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-black">{userStats.totalReports}</div>
									<p className="text-sm text-gray-600">Reports Submitted</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-green-600">{userStats.resolvedReports}</div>
									<p className="text-sm text-gray-600">Issues Resolved</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-orange-600">{userStats.inProgressReports}</div>
									<p className="text-sm text-gray-600">In Progress</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-black">{userStats.impactScore}</div>
									<p className="text-sm text-gray-600">Impact Score</p>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Contribution Level */}
				{userStats && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5" />
								Contribution Level
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="font-medium text-black">
										{userStats.impactScore < 100 ? "Newcomer" : 
										 userStats.impactScore < 250 ? "Contributor" :
										 userStats.impactScore < 500 ? "Advocate" : "Champion"}
									</span>
									<span className="text-sm text-gray-600">{userStats.impactScore}/500 points</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
									<div 
										className="h-full bg-black rounded-full transition-all"
										style={{ width: `${Math.min((userStats.impactScore / 500) * 100, 100)}%` }}
									/>
								</div>
								<p className="text-sm text-gray-600">
									Keep contributing to increase your impact score and unlock new levels!
								</p>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<Button
								variant="outline"
								onClick={() => router.push("/map")}
								className="h-12 justify-start"
							>
								<MapPin className="mr-3 h-4 w-4" />
								View Map
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push("/home")}
								className="h-12 justify-start"
							>
								<TrendingUp className="mr-3 h-4 w-4" />
								View Activity
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}