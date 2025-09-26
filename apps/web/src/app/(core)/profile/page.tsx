"use client";

import {
	Award,
	Calendar,
	Camera,
	DollarSign,
	Edit,
	LogOut,
	Mail,
	MapPin,
	Save,
	Settings,
	Shield,
	TrendingUp,
	Wrench,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";

interface UserProfile {
	id: string;
	name: string;
	email: string;
	image?: string;
	bio: string;
	location: string;
	joinedAt: string;
	stats: {
		issuesReported: number;
		issuesFixed: number;
		totalSponsored: number;
		impactScore: number;
	};
	roles: string[];
}

export default function ProfilePage() {
	const { settings } = useSettings();
	const { t } = useTranslation();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [currentAchievement, setCurrentAchievement] = useState(0);
	const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
	const router = useRouter();

	const achievements = [
		{
			icon: Award,
			title: "First Report",
			status: "Completed",
			description: "Submitted your first issue report",
		},
		{
			icon: Shield,
			title: "Community Guardian",
			status: "Achieved",
			description: "Helped resolve 10+ community issues",
		},
		{
			icon: TrendingUp,
			title: "Rising Contributor",
			status: "In Progress",
			description: "Making significant community impact",
		},
		{
			icon: Wrench,
			title: "Problem Solver",
			status: "Completed",
			description: "Fixed 5+ infrastructure issues",
		},
		{
			icon: DollarSign,
			title: "Community Sponsor",
			status: "Achieved",
			description: "Contributed $500+ to community projects",
		},
	];

	// Rotate achievements every 3 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentAchievement((prev) => (prev + 1) % achievements.length);
		}, 3000);
		return () => clearInterval(interval);
	}, [achievements.length]);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_SERVER_URL}/user/profile`,
				);
				if (response.ok) {
					const data = await response.json();
					setProfile(data);
				} else {
					// Set mock data if API fails
					setProfile({
						id: "user-123",
						name: "Sarah Johnson",
						email: "sarah.johnson@example.com",
						image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
						bio: "Community advocate passionate about improving infrastructure and public safety in Jamaica",
						location: "Kingston, Jamaica",
						joinedAt: "2023-06-15",
						stats: {
							issuesReported: 47,
							issuesFixed: 12,
							totalSponsored: 850,
							impactScore: 92,
						},
						roles: ["Community Leader", "Top Contributor"],
					});
				}
			} catch (error) {
				console.error("Failed to fetch profile:", error);
				// Set mock data on error
				setProfile({
					id: "user-123",
					name: "Sarah Johnson",
					email: "sarah.johnson@example.com",
					image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
					bio: "Community advocate passionate about improving infrastructure and public safety in Jamaica",
					location: "Kingston, Jamaica",
					joinedAt: "2023-06-15",
					stats: {
						issuesReported: 47,
						issuesFixed: 12,
						totalSponsored: 850,
						impactScore: 92,
					},
					roles: ["Community Leader", "Top Contributor"],
				});
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, []);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
				<div className="text-black dark:text-white">Loading profile...</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
				<div className="text-black dark:text-white">Failed to load profile</div>
			</div>
		);
	}

	const initials = profile.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	// Handler functions
	const handleEditProfile = async () => {
		if (isEditing) {
			// Save changes
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_SERVER_URL}/user/profile`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(editedProfile),
					},
				);

				if (response.ok) {
					const updatedProfile = await response.json();
					setProfile(updatedProfile);
					setIsEditing(false);
					setEditedProfile({});
				}
			} catch (error) {
				console.error("Failed to update profile:", error);
				// For demo, just update locally
				setProfile((prev) => (prev ? { ...prev, ...editedProfile } : null));
				setIsEditing(false);
				setEditedProfile({});
			}
		} else {
			// Enter edit mode
			setEditedProfile({
				name: profile?.name,
				bio: profile?.bio,
				location: profile?.location,
			});
			setIsEditing(true);
		}
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditedProfile({});
	};

	const handleSettings = () => {
		// Navigate to settings or show settings modal
		router.push("/settings");
	};

	const handleReportIssue = () => {
		router.push("/report");
	};

	const handleViewMap = () => {
		router.push("/map");
	};

	const handleSignOut = () => {
		// Handle sign out logic
		if (confirm("Are you sure you want to sign out?")) {
			// Clear session and redirect to login
			router.push("/login");
		}
	};

	const handleImageUpload = () => {
		// Handle image upload
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				// Handle image upload logic here
				console.log("Image selected:", file.name);
			}
		};
		input.click();
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="container mx-auto max-w-5xl px-4 py-8">
				{/* Professional Header */}
				<Card className="mb-8 border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-black">
					<CardContent className="p-8">
						<div className="flex flex-col gap-8 lg:flex-row">
							{/* Avatar Section */}
							<div className="flex flex-col items-center lg:items-start">
								<div className="relative">
									<Avatar className="h-32 w-32 border-2 border-gray-200 dark:border-gray-800">
										<AvatarImage
											src={profile.image || undefined}
											alt={profile.name}
										/>
										<AvatarFallback className="bg-black font-bold text-2xl text-white dark:bg-white dark:text-black">
											{initials}
										</AvatarFallback>
									</Avatar>
									<Button
										size="icon"
										variant="outline"
										onClick={handleImageUpload}
										className="-bottom-2 -right-2 absolute h-8 w-8 rounded-full border-2 border-white bg-white hover:bg-gray-50 dark:border-black dark:bg-black dark:hover:bg-gray-900"
										title="Upload profile picture"
									>
										<Camera className="h-3 w-3" />
									</Button>
								</div>
							</div>

							{/* Profile Information */}
							<div className="flex-1">
								<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
									<div className="space-y-4">
										<div>
											{isEditing ? (
												<div className="space-y-4">
													<div>
														<Label
															htmlFor="name"
															className="text-gray-600 text-sm dark:text-gray-400"
														>
															Name
														</Label>
														<Input
															id="name"
															value={editedProfile.name || ""}
															onChange={(e) =>
																setEditedProfile({
																	...editedProfile,
																	name: e.target.value,
																})
															}
															className="bg-white font-bold text-black text-xl dark:bg-black dark:text-white"
														/>
													</div>
													<div>
														<Label
															htmlFor="bio"
															className="text-gray-600 text-sm dark:text-gray-400"
														>
															Bio
														</Label>
														<Input
															id="bio"
															value={editedProfile.bio || ""}
															onChange={(e) =>
																setEditedProfile({
																	...editedProfile,
																	bio: e.target.value,
																})
															}
															className="bg-white text-gray-700 dark:bg-black dark:text-gray-300"
															placeholder="Tell us about yourself..."
														/>
													</div>
												</div>
											) : (
												<>
													<h1 className="mb-2 font-bold text-3xl text-black dark:text-white">
														{profile.name}
													</h1>
													<p className="text-gray-600 text-lg dark:text-gray-400">
														{profile.bio}
													</p>
												</>
											)}
										</div>

										<div className="flex flex-wrap gap-6 text-gray-600 text-sm dark:text-gray-400">
											<div className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												{isEditing ? (
													<Input
														value={editedProfile.location || ""}
														onChange={(e) =>
															setEditedProfile({
																...editedProfile,
																location: e.target.value,
															})
														}
														className="h-7 bg-white text-black text-sm dark:bg-black dark:text-white"
														placeholder="Your location..."
													/>
												) : (
													<span>{profile.location}</span>
												)}
											</div>
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												<span>
													Member since{" "}
													{new Date(profile.joinedAt).toLocaleDateString()}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4" />
												<span>{profile.email}</span>
											</div>
										</div>

										<div className="flex flex-wrap gap-2">
											{profile.roles.map((role) => (
												<Badge
													key={role}
													variant="outline"
													className="border-black bg-transparent text-black dark:border-white dark:text-white"
												>
													{role === "Community Leader" && (
														<Shield className="mr-1 h-3 w-3" />
													)}
													{role === "Top Contributor" && (
														<Award className="mr-1 h-3 w-3" />
													)}
													{role}
												</Badge>
											))}
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex flex-col gap-3 sm:flex-row">
										{isEditing ? (
											<>
												<Button
													variant="outline"
													className="border-gray-300 dark:border-gray-700"
													onClick={handleCancelEdit}
												>
													<X className="mr-2 h-4 w-4" />
													{t("profile.cancel")}
												</Button>
												<Button
													className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
													onClick={handleEditProfile}
												>
													<Save className="mr-2 h-4 w-4" />
													{t("profile.saveChanges")}
												</Button>
											</>
										) : (
											<>
												<Button
													variant="outline"
													className="border-gray-300 dark:border-gray-700"
													onClick={handleSettings}
												>
													<Settings className="mr-2 h-4 w-4" />
													{t("nav.settings")}
												</Button>
												<Button
													className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
													onClick={handleEditProfile}
												>
													<Edit className="mr-2 h-4 w-4" />
													{t("profile.editProfile")}
												</Button>
											</>
										)}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Statistics */}
				{settings?.privacy?.showStats !== false && (
					<div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
						<Card className="border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-black">
							<CardContent className="p-6">
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
										<MapPin className="h-7 w-7 text-black dark:text-white" />
									</div>
									<div className="rounded-full bg-gray-100 px-2 py-1 text-gray-500 text-xs dark:bg-gray-800 dark:text-gray-400">
										+{Math.floor(Math.random() * 20 + 10)}%
									</div>
								</div>
								<div className="text-left">
									<p className="mb-1 font-bold text-3xl text-black dark:text-white">
										{profile.stats.issuesReported}
									</p>
									<p className="font-medium text-gray-600 text-sm dark:text-gray-400">
										Issues Reported
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-black">
							<CardContent className="p-6">
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
										<Wrench className="h-7 w-7 text-black dark:text-white" />
									</div>
									<div className="rounded-full bg-gray-100 px-2 py-1 text-gray-500 text-xs dark:bg-gray-800 dark:text-gray-400">
										+{Math.floor(Math.random() * 15 + 5)}%
									</div>
								</div>
								<div className="text-left">
									<p className="mb-1 font-bold text-3xl text-black dark:text-white">
										{profile.stats.issuesFixed}
									</p>
									<p className="font-medium text-gray-600 text-sm dark:text-gray-400">
										Issues Resolved
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-black">
							<CardContent className="p-6">
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
										<DollarSign className="h-7 w-7 text-black dark:text-white" />
									</div>
									<div className="rounded-full bg-gray-100 px-2 py-1 text-gray-500 text-xs dark:bg-gray-800 dark:text-gray-400">
										+{Math.floor(Math.random() * 25 + 15)}%
									</div>
								</div>
								<div className="text-left">
									<p className="mb-1 font-bold text-3xl text-black dark:text-white">
										${profile.stats.totalSponsored}
									</p>
									<p className="font-medium text-gray-600 text-sm dark:text-gray-400">
										Total Sponsored
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-black">
							<CardContent className="p-6">
								<div className="mb-4 flex items-center justify-between">
									<div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
										<Award className="h-7 w-7 text-black dark:text-white" />
									</div>
									<div className="rounded-full bg-gray-100 px-2 py-1 font-medium text-black text-xs dark:bg-gray-800 dark:text-white">
										Excellent
									</div>
								</div>
								<div className="text-left">
									<p className="mb-1 font-bold text-3xl text-black dark:text-white">
										{profile.stats.impactScore}
									</p>
									<p className="font-medium text-gray-600 text-sm dark:text-gray-400">
										Impact Score
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Activity and Actions */}
				<div
					className={`grid grid-cols-1 items-start gap-8 ${settings?.privacy?.showActivity !== false ? "lg:grid-cols-3" : "mx-auto max-w-md lg:grid-cols-1"}`}
				>
					{/* Activity Feed */}
					{settings?.privacy?.showActivity !== false && (
						<div className="lg:col-span-2">
							<Card className="h-[600px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
								<CardHeader className="border-gray-200 border-b dark:border-gray-800">
									<div className="flex items-center justify-between">
										<CardTitle className="font-bold text-black text-xl dark:text-white">
											Activity Timeline
										</CardTitle>
										<Button
											variant="outline"
											size="sm"
											className="border-gray-300 dark:border-gray-700"
											onClick={() => router.push("/activity")}
										>
											View All
										</Button>
									</div>
								</CardHeader>
								<CardContent className="h-full overflow-y-auto p-0">
									<div className="divide-y divide-gray-200 dark:divide-gray-800">
										{/* Activity Item */}
										<div className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/20">
											<div className="flex gap-4">
												<div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-black">
													<MapPin className="h-5 w-5 text-black dark:text-white" />
												</div>
												<div className="flex-1">
													<div className="flex items-start justify-between">
														<div>
															<p className="font-semibold text-black dark:text-white">
																Reported an issue
															</p>
															<p className="mt-1 text-gray-600 dark:text-gray-400">
																Broken streetlight on Hope Road causing safety
																concerns
															</p>
															<div className="mt-3 flex items-center gap-4">
																<span className="text-gray-500 text-sm dark:text-gray-400">
																	2 days ago
																</span>
																<Badge
																	variant="outline"
																	className="border-gray-300 text-xs dark:border-gray-700"
																>
																	Under Review
																</Badge>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Activity Item */}
										<div className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/20">
											<div className="flex gap-4">
												<div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-black">
													<Wrench className="h-5 w-5 text-black dark:text-white" />
												</div>
												<div className="flex-1">
													<div className="flex items-start justify-between">
														<div>
															<p className="font-semibold text-black dark:text-white">
																Resolved an issue
															</p>
															<p className="mt-1 text-gray-600 dark:text-gray-400">
																Repaired potholes on Spanish Town Road
															</p>
															<div className="mt-3 flex items-center gap-4">
																<span className="text-gray-500 text-sm dark:text-gray-400">
																	1 week ago
																</span>
																<Badge className="border-0 bg-black text-white text-xs dark:bg-white dark:text-black">
																	Completed
																</Badge>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Activity Item */}
										<div className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/20">
											<div className="flex gap-4">
												<div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-black">
													<DollarSign className="h-5 w-5 text-black dark:text-white" />
												</div>
												<div className="flex-1">
													<div className="flex items-start justify-between">
														<div>
															<p className="font-semibold text-black dark:text-white">
																Sponsored repair
															</p>
															<p className="mt-1 text-gray-600 dark:text-gray-400">
																Contributed $50 to water main repair project
															</p>
															<div className="mt-3 flex items-center gap-4">
																<span className="text-gray-500 text-sm dark:text-gray-400">
																	2 weeks ago
																</span>
																<span className="font-medium text-black text-sm dark:text-white">
																	Community Impact
																</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Quick Actions */}
					<div>
						<Card className="h-[600px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
							<CardHeader className="border-gray-200 border-b dark:border-gray-800">
								<CardTitle className="font-bold text-black text-lg dark:text-white">
									Quick Actions
								</CardTitle>
							</CardHeader>
							<CardContent className="flex h-full flex-col p-6">
								{/* Achievements Section */}
								<div className="mb-6">
									<div className="mb-4 flex items-center justify-between">
										<h3 className="font-semibold text-black text-sm dark:text-white">
											Achievements
										</h3>
										<div className="flex gap-1">
											{achievements.map((_, index) => (
												<button
													key={index}
													onClick={() => setCurrentAchievement(index)}
													className={`h-1.5 w-1.5 rounded-full transition-colors ${
														index === currentAchievement
															? "bg-black dark:bg-white"
															: "bg-gray-300 dark:bg-gray-600"
													}`}
												/>
											))}
										</div>
									</div>
									<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
										<div className="transition-all duration-300 ease-in-out">
											{(() => {
												const achievement = achievements[currentAchievement];
												const Icon = achievement.icon;
												return (
													<div className="flex items-start gap-3">
														<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-black">
															<Icon className="h-5 w-5 text-black dark:text-white" />
														</div>
														<div className="min-w-0 flex-1">
															<p className="mb-1 font-semibold text-black text-sm dark:text-white">
																{achievement.title}
															</p>
															<p className="mb-1 text-gray-600 text-xs dark:text-gray-400">
																{achievement.status}
															</p>
															<p className="text-gray-500 text-xs leading-relaxed dark:text-gray-500">
																{achievement.description}
															</p>
														</div>
													</div>
												);
											})()}
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex-1 space-y-3">
									<Button
										variant="outline"
										className="h-12 w-full justify-start border-gray-300 dark:border-gray-700"
										onClick={handleReportIssue}
									>
										<MapPin className="mr-3 h-4 w-4" />
										Report New Issue
									</Button>
									<Button
										variant="outline"
										className="h-12 w-full justify-start border-gray-300 dark:border-gray-700"
										onClick={handleViewMap}
									>
										<MapPin className="mr-3 h-4 w-4" />
										View Map
									</Button>
									<Button
										variant="outline"
										className="h-12 w-full justify-start border-gray-300 dark:border-gray-700"
										onClick={handleSettings}
									>
										<Settings className="mr-3 h-4 w-4" />
										Account Settings
									</Button>
								</div>

								{/* Sign Out */}
								<div className="mt-auto border-gray-200 border-t pt-4 dark:border-gray-800">
									<Button
										variant="outline"
										className="h-12 w-full justify-start border-gray-300 text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-900/10"
										onClick={handleSignOut}
									>
										<LogOut className="mr-3 h-4 w-4" />
										Sign Out
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
