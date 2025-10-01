"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@web/components/ui/avatar";
import { useAuth } from "@web/components/auth-provider";
import { eden } from "@web/lib/eden";
import { getInitials } from "@web/lib/utils";
import { LogOut, MapPin, TrendingUp } from "lucide-react";
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
		<div className="min-h-screen bg-white">
			{/* Profile Header */}
			<div className="border-b border-gray-200 px-3 lg:px-4 py-4 hover:bg-gray-50">
				<div className="flex items-center space-x-3">
					<Avatar className="h-12 w-12 flex-shrink-0">
						<AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.user_metadata?.name || user.email} />
						<AvatarFallback className="bg-gray-200 text-gray-700 text-lg">
							{getInitials(user.user_metadata?.name || user.email || 'User')}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<div className="flex items-center space-x-1">
							<span className="font-semibold text-black">
								{user.user_metadata?.name || user.email}
							</span>
							{user.email_confirmed_at && (
								<svg viewBox="0 0 22 22" className="h-4 w-4 text-blue-500">
									<path
										fill="currentColor"
										d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
									/>
								</svg>
							)}
						</div>
						<div className="text-gray-600 text-sm">
							<span>@{user.email?.split('@')[0] || "user"}</span>
							<span className="mx-1">·</span>
							<span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
						</div>
					</div>
				</div>
			</div>

			{/* User Statistics */}
			{userStats && (
				<div className="border-b border-gray-200 px-3 lg:px-4 py-4">
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-black">{userStats.totalReports}</div>
							<p className="text-sm text-gray-600 mt-1">Reports</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">{userStats.resolvedReports}</div>
							<p className="text-sm text-gray-600 mt-1">Resolved</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">{userStats.inProgressReports}</div>
							<p className="text-sm text-gray-600 mt-1">In Progress</p>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-black">{userStats.impactScore}</div>
							<p className="text-sm text-gray-600 mt-1">Impact Score</p>
						</div>
					</div>
				</div>
			)}

			{/* Contribution Level */}
			{userStats && (
				<div className="border-b border-gray-200 px-3 lg:px-4 py-4 hover:bg-gray-50">
					<div className="flex items-center gap-2 mb-4">
						<TrendingUp className="h-5 w-5 text-black" />
						<h3 className="font-semibold text-black">Contribution Level</h3>
					</div>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="font-medium text-black">
								{userStats.impactScore < 100 ? "Newcomer" : 
								 userStats.impactScore < 250 ? "Contributor" :
								 userStats.impactScore < 500 ? "Advocate" : "Champion"}
							</span>
							<span className="text-sm text-gray-600">{userStats.impactScore}/500 points</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
							<div 
								className="h-full bg-black rounded-full transition-all"
								style={{ width: `${Math.min((userStats.impactScore / 500) * 100, 100)}%` }}
							/>
						</div>
						<p className="text-sm text-gray-600">
							Keep contributing to increase your impact score and unlock new levels!
						</p>
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="border-b border-gray-200 px-3 lg:px-4 py-3 hover:bg-gray-50">
				<button
					onClick={() => router.push("/map")}
					className="w-full flex items-center space-x-3 py-3 text-left hover:bg-gray-100 rounded-lg px-3"
				>
					<MapPin className="h-5 w-5 text-gray-600" />
					<span className="font-medium text-black">View Map</span>
				</button>
			</div>

			<div className="border-b border-gray-200 px-3 lg:px-4 py-3 hover:bg-gray-50">
				<button
					onClick={() => router.push("/home")}
					className="w-full flex items-center space-x-3 py-3 text-left hover:bg-gray-100 rounded-lg px-3"
				>
					<TrendingUp className="h-5 w-5 text-gray-600" />
					<span className="font-medium text-black">View Activity</span>
				</button>
			</div>

			<div className="border-b border-gray-200 px-3 lg:px-4 py-3 hover:bg-gray-50">
				<button
					onClick={() => router.push("/settings")}
					className="w-full flex items-center space-x-3 py-3 text-left hover:bg-gray-100 rounded-lg px-3"
				>
					<span className="font-medium text-black">Settings</span>
				</button>
			</div>

			<div className="border-b border-gray-200 px-3 lg:px-4 py-3 hover:bg-gray-50">
				<button
					onClick={handleSignOut}
					className="w-full flex items-center space-x-3 py-3 text-left hover:bg-gray-100 rounded-lg px-3"
				>
					<LogOut className="h-5 w-5 text-red-600" />
					<span className="font-medium text-red-600">Sign Out</span>
				</button>
			</div>

			{/* User's Recent Experiences */}
			{userExperiences.length > 0 && (
				<div className="border-b border-gray-200 px-3 lg:px-4 py-4">
					<h3 className="font-semibold text-black mb-3">Recent Experiences</h3>
					<div className="space-y-3">
						{userExperiences.slice(0, 3).map((experience) => (
							<div key={experience.id} className="p-3 bg-gray-50 rounded-lg">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h4 className="font-medium text-black text-sm">{experience.title}</h4>
										<p className="text-gray-600 text-xs mt-1 line-clamp-2">{experience.description}</p>
										<div className="flex items-center space-x-2 mt-2">
											<span className={`text-xs px-2 py-1 rounded-full ${
												experience.status === 'resolved' ? 'bg-green-100 text-green-800' :
												experience.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
												'bg-gray-100 text-gray-800'
											}`}>
												{experience.status}
											</span>
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
							<button 
								onClick={() => router.push("/home")}
								className="w-full text-center py-2 text-sm text-gray-600 hover:text-black"
							>
								View all {userExperiences.length} experiences →
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}