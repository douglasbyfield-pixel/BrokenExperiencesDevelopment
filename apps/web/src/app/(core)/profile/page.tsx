"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { BackButton } from "@web/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { useAuth } from "@web/components/auth-provider";
import { eden } from "@web/lib/eden";
import { getInitials } from "@web/lib/utils";
import { 
	ArrowLeft, 
	Calendar, 
	CheckCircle, 
	Clock, 
	LogOut, 
	MapPin, 
	Settings, 
	TrendingUp,
	User,
	Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
	const router = useRouter();
	const { user, signOut, isLoading } = useAuth();
	const [userStats, setUserStats] = useState<any>(null);
	const [userExperiences, setUserExperiences] = useState<any[]>([]);
	const [statsLoading, setStatsLoading] = useState(true);

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
						// Filter experiences by user email (temporary solution until backend auth is updated)
						const filteredUserExperiences = allExperiences.data.filter(
							exp => exp.reportedBy?.email === user.email
						);
						
						// Set user experiences for display
						setUserExperiences(filteredUserExperiences);
						
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
							inProgressReports: inProgressReports + pendingReports, // Combine pending and in_progress
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
				} finally {
					setStatsLoading(false);
				}
			};

			fetchUserStats();
		}
	}, [user, isLoading, router]);

	const handleSignOut = async () => {
		await signOut();
	};

	if (isLoading) {
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
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-4">
				<div className="flex items-center space-x-3">
					<BackButton fallbackUrl="/home" />
					<h1 className="text-xl font-semibold text-black">Profile</h1>
				</div>
			</div>

			<div className="max-w-4xl mx-auto p-4 space-y-6">
				{/* Profile Card */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-4">
							<Avatar className="h-16 w-16">
								<AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.user_metadata?.name || user.email} />
								<AvatarFallback className="bg-gray-200 text-gray-700 text-xl">
									{getInitials(user.user_metadata?.name || user.email || 'User')}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<div className="flex items-center space-x-2">
									<h2 className="text-xl font-semibold text-black">
										{user.user_metadata?.name || user.email}
									</h2>
									{user.email_confirmed_at && (
										<Badge variant="secondary" className="bg-blue-100 text-blue-800">
											<CheckCircle className="h-3 w-3 mr-1" />
											Verified
										</Badge>
									)}
								</div>
								<p className="text-gray-600 text-sm mt-1">
									@{user.email?.split('@')[0] || "user"}
								</p>
								<div className="flex items-center text-gray-500 text-sm mt-2">
									<Calendar className="h-4 w-4 mr-1" />
									Member since {new Date(user.created_at).toLocaleDateString()}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Statistics Cards */}
				{userStats && (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-black">{userStats.totalReports}</div>
								<p className="text-sm text-gray-600 mt-1">Total Reports</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-green-600">{userStats.resolvedReports}</div>
								<p className="text-sm text-gray-600 mt-1">Resolved</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-orange-600">{userStats.inProgressReports}</div>
								<p className="text-sm text-gray-600 mt-1">In Progress</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="text-2xl font-bold text-blue-600">{userStats.impactScore}</div>
								<p className="text-sm text-gray-600 mt-1">Impact Score</p>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Contribution Level */}
				{userStats && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Zap className="h-5 w-5 text-yellow-500" />
								Contribution Level
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Badge 
										variant="secondary" 
										className={`${
											userStats.impactScore < 100 ? "bg-gray-100 text-gray-800" :
											userStats.impactScore < 250 ? "bg-blue-100 text-blue-800" :
											userStats.impactScore < 500 ? "bg-purple-100 text-purple-800" : 
											"bg-yellow-100 text-yellow-800"
										}`}
									>
										{userStats.impactScore < 100 ? "Newcomer" : 
										 userStats.impactScore < 250 ? "Contributor" :
										 userStats.impactScore < 500 ? "Advocate" : "Champion"}
									</Badge>
									<span className="text-sm text-gray-600">{userStats.impactScore}/500 points</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
									<div 
										className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
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
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Quick Actions
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => router.push("/map")}
						>
							<MapPin className="h-4 w-4 mr-2" />
							View Map
						</Button>
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => router.push("/home")}
						>
							<TrendingUp className="h-4 w-4 mr-2" />
							View Activity
						</Button>
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={() => router.push("/settings")}
						>
							<Settings className="h-4 w-4 mr-2" />
							Settings
						</Button>
						<Button
							variant="outline"
							className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
							onClick={handleSignOut}
						>
							<LogOut className="h-4 w-4 mr-2" />
							Sign Out
						</Button>
					</CardContent>
				</Card>

				{/* Recent Experiences */}
				{userExperiences.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Recent Experiences
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{userExperiences.slice(0, 3).map((experience) => (
									<div key={experience.id} className="p-4 bg-gray-50 rounded-lg border">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="font-medium text-black text-sm">{experience.title}</h4>
												<p className="text-gray-600 text-xs mt-1 line-clamp-2">{experience.description}</p>
												<div className="flex items-center space-x-2 mt-3">
													<Badge 
														variant="secondary"
														className={`text-xs ${
															experience.status === 'resolved' ? 'bg-green-100 text-green-800' :
															experience.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
															'bg-gray-100 text-gray-800'
														}`}
													>
														{experience.status}
													</Badge>
													<span className="text-xs text-gray-500">
														{new Date(experience.createdAt).toLocaleDateString()}
													</span>
												</div>
											</div>
											<div className="ml-3 text-right">
												<div className="flex items-center text-red-500">
													<span className="text-xs font-medium">{experience.upvotes || 0}</span>
												</div>
											</div>
										</div>
									</div>
								))}
								{userExperiences.length > 3 && (
									<Button 
										variant="outline"
										className="w-full"
										onClick={() => router.push("/home")}
									>
										View all {userExperiences.length} experiences →
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}