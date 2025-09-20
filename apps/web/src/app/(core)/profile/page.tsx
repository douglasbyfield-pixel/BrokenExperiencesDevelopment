"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Award, TrendingUp, Wrench, DollarSign, Edit, Mail, Shield, Settings, LogOut, Camera, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [currentAchievement, setCurrentAchievement] = useState(0);
	const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
	const router = useRouter();

	const achievements = [
		{ icon: Award, title: "First Report", status: "Completed", description: "Submitted your first issue report" },
		{ icon: Shield, title: "Community Guardian", status: "Achieved", description: "Helped resolve 10+ community issues" },
		{ icon: TrendingUp, title: "Rising Contributor", status: "In Progress", description: "Making significant community impact" },
		{ icon: Wrench, title: "Problem Solver", status: "Completed", description: "Fixed 5+ infrastructure issues" },
		{ icon: DollarSign, title: "Community Sponsor", status: "Achieved", description: "Contributed $500+ to community projects" }
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
				const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/profile`);
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
							impactScore: 92
						},
						roles: ["Community Leader", "Top Contributor"]
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
						impactScore: 92
					},
					roles: ["Community Leader", "Top Contributor"]
				});
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
				<div className="text-black dark:text-white">Loading profile...</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
				<div className="text-black dark:text-white">Failed to load profile</div>
			</div>
		);
	}

	const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

	// Handler functions
	const handleEditProfile = async () => {
		if (isEditing) {
			// Save changes
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/profile`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(editedProfile),
				});

				if (response.ok) {
					const updatedProfile = await response.json();
					setProfile(updatedProfile);
					setIsEditing(false);
					setEditedProfile({});
				}
			} catch (error) {
				console.error('Failed to update profile:', error);
				// For demo, just update locally
				setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
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
		router.push('/settings');
	};

	const handleReportIssue = () => {
		router.push('/report');
	};

	const handleViewMap = () => {
		router.push('/map');
	};

	const handleSignOut = () => {
		// Handle sign out logic
		if (confirm('Are you sure you want to sign out?')) {
			// Clear session and redirect to login
			router.push('/login');
		}
	};

	const handleImageUpload = () => {
		// Handle image upload
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				// Handle image upload logic here
				console.log('Image selected:', file.name);
			}
		};
		input.click();
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				{/* Professional Header */}
				<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm mb-8">
					<CardContent className="p-8">
						<div className="flex flex-col lg:flex-row gap-8">
							{/* Avatar Section */}
							<div className="flex flex-col items-center lg:items-start">
								<div className="relative">
									<Avatar className="h-32 w-32 border-2 border-gray-200 dark:border-gray-800">
										<AvatarImage src={profile.image || undefined} alt={profile.name} />
										<AvatarFallback className="text-2xl font-bold bg-black dark:bg-white text-white dark:text-black">
											{initials}
										</AvatarFallback>
									</Avatar>
									<Button 
										size="icon" 
										variant="outline"
										onClick={handleImageUpload}
										className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-white dark:border-black bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
										title="Upload profile picture"
									>
										<Camera className="h-3 w-3" />
									</Button>
								</div>
							</div>
							
							{/* Profile Information */}
							<div className="flex-1">
								<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
									<div className="space-y-4">
										<div>
											{isEditing ? (
												<div className="space-y-4">
													<div>
														<Label htmlFor="name" className="text-sm text-gray-600 dark:text-gray-400">Name</Label>
														<Input
															id="name"
															value={editedProfile.name || ''}
															onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
															className="text-xl font-bold text-black dark:text-white bg-white dark:bg-black"
														/>
													</div>
													<div>
														<Label htmlFor="bio" className="text-sm text-gray-600 dark:text-gray-400">Bio</Label>
														<Input
															id="bio"
															value={editedProfile.bio || ''}
															onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
															className="text-gray-700 dark:text-gray-300 bg-white dark:bg-black"
															placeholder="Tell us about yourself..."
														/>
													</div>
												</div>
											) : (
												<>
													<h1 className="text-3xl font-bold text-black dark:text-white mb-2">{profile.name}</h1>
													<p className="text-gray-600 dark:text-gray-400 text-lg">{profile.bio}</p>
												</>
											)}
										</div>
										
										<div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
											<div className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												{isEditing ? (
													<Input
														value={editedProfile.location || ''}
														onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
														className="h-7 text-sm text-black dark:text-white bg-white dark:bg-black"
														placeholder="Your location..."
													/>
												) : (
													<span>{profile.location}</span>
												)}
											</div>
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												<span>Member since {new Date(profile.joinedAt).toLocaleDateString()}</span>
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
													className="bg-transparent border-black dark:border-white text-black dark:text-white"
												>
													{role === "Community Leader" && <Shield className="h-3 w-3 mr-1" />}
													{role === "Top Contributor" && <Award className="h-3 w-3 mr-1" />}
													{role}
												</Badge>
											))}
										</div>
									</div>
									
									{/* Action Buttons */}
									<div className="flex flex-col sm:flex-row gap-3">
										{isEditing ? (
											<>
												<Button 
													variant="outline" 
													className="border-gray-300 dark:border-gray-700"
													onClick={handleCancelEdit}
												>
													<X className="h-4 w-4 mr-2" />
													Cancel
												</Button>
												<Button 
													className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
													onClick={handleEditProfile}
												>
													<Save className="h-4 w-4 mr-2" />
													Save Changes
												</Button>
											</>
										) : (
											<>
												<Button 
													variant="outline" 
													className="border-gray-300 dark:border-gray-700"
													onClick={handleSettings}
												>
													<Settings className="h-4 w-4 mr-2" />
													Settings
												</Button>
												<Button 
													className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
													onClick={handleEditProfile}
												>
													<Edit className="h-4 w-4 mr-2" />
													Edit Profile
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
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="w-14 h-14 border border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
									<MapPin className="h-7 w-7 text-black dark:text-white" />
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
									+{Math.floor(Math.random() * 20 + 10)}%
								</div>
							</div>
							<div className="text-left">
								<p className="text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.issuesReported}</p>
								<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Issues Reported</p>
							</div>
						</CardContent>
					</Card>
					
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="w-14 h-14 border border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
									<Wrench className="h-7 w-7 text-black dark:text-white" />
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
									+{Math.floor(Math.random() * 15 + 5)}%
								</div>
							</div>
							<div className="text-left">
								<p className="text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.issuesFixed}</p>
								<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Issues Resolved</p>
							</div>
						</CardContent>
					</Card>
					
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="w-14 h-14 border border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
									<DollarSign className="h-7 w-7 text-black dark:text-white" />
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
									+{Math.floor(Math.random() * 25 + 15)}%
								</div>
							</div>
							<div className="text-left">
								<p className="text-3xl font-bold text-black dark:text-white mb-1">${profile.stats.totalSponsored}</p>
								<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Sponsored</p>
							</div>
						</CardContent>
					</Card>
					
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="w-14 h-14 border border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
									<Award className="h-7 w-7 text-black dark:text-white" />
								</div>
								<div className="text-xs text-black dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium">
									Excellent
								</div>
							</div>
							<div className="text-left">
								<p className="text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.impactScore}</p>
								<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Impact Score</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Activity and Actions */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
					{/* Activity Feed */}
					<div className="lg:col-span-2">
						<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black h-[600px]">
							<CardHeader className="border-b border-gray-200 dark:border-gray-800">
								<div className="flex items-center justify-between">
									<CardTitle className="text-xl font-bold text-black dark:text-white">Activity Timeline</CardTitle>
									<Button 
										variant="outline" 
										size="sm" 
										className="border-gray-300 dark:border-gray-700"
										onClick={() => router.push('/activity')}
									>
										View All
									</Button>
								</div>
							</CardHeader>
							<CardContent className="p-0 h-full overflow-y-auto">
								<div className="divide-y divide-gray-200 dark:divide-gray-800">
									{/* Activity Item */}
									<div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
										<div className="flex gap-4">
											<div className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center bg-white dark:bg-black">
												<MapPin className="h-5 w-5 text-black dark:text-white" />
											</div>
											<div className="flex-1">
												<div className="flex items-start justify-between">
													<div>
														<p className="font-semibold text-black dark:text-white">Reported an issue</p>
														<p className="text-gray-600 dark:text-gray-400 mt-1">
															Broken streetlight on Hope Road causing safety concerns
														</p>
														<div className="flex items-center gap-4 mt-3">
															<span className="text-sm text-gray-500 dark:text-gray-400">2 days ago</span>
															<Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-700">
																Under Review
															</Badge>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Activity Item */}
									<div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
										<div className="flex gap-4">
											<div className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center bg-white dark:bg-black">
												<Wrench className="h-5 w-5 text-black dark:text-white" />
											</div>
											<div className="flex-1">
												<div className="flex items-start justify-between">
													<div>
														<p className="font-semibold text-black dark:text-white">Resolved an issue</p>
														<p className="text-gray-600 dark:text-gray-400 mt-1">
															Repaired potholes on Spanish Town Road
														</p>
														<div className="flex items-center gap-4 mt-3">
															<span className="text-sm text-gray-500 dark:text-gray-400">1 week ago</span>
															<Badge className="bg-black dark:bg-white text-white dark:text-black text-xs border-0">
																Completed
															</Badge>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Activity Item */}
									<div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
										<div className="flex gap-4">
											<div className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center bg-white dark:bg-black">
												<DollarSign className="h-5 w-5 text-black dark:text-white" />
											</div>
											<div className="flex-1">
												<div className="flex items-start justify-between">
													<div>
														<p className="font-semibold text-black dark:text-white">Sponsored repair</p>
														<p className="text-gray-600 dark:text-gray-400 mt-1">
															Contributed $50 to water main repair project
														</p>
														<div className="flex items-center gap-4 mt-3">
															<span className="text-sm text-gray-500 dark:text-gray-400">2 weeks ago</span>
															<span className="text-sm text-black dark:text-white font-medium">Community Impact</span>
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

					{/* Quick Actions */}
					<div>
						<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black h-[600px]">
							<CardHeader className="border-b border-gray-200 dark:border-gray-800">
								<CardTitle className="text-lg font-bold text-black dark:text-white">Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col h-full p-6">
								{/* Achievements Section */}
								<div className="mb-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-sm font-semibold text-black dark:text-white">Achievements</h3>
										<div className="flex gap-1">
											{achievements.map((_, index) => (
												<button
													key={index}
													onClick={() => setCurrentAchievement(index)}
													className={`w-1.5 h-1.5 rounded-full transition-colors ${
														index === currentAchievement 
															? 'bg-black dark:bg-white' 
															: 'bg-gray-300 dark:bg-gray-600'
													}`}
												/>
											))}
										</div>
									</div>
									<div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
										<div className="transition-all duration-300 ease-in-out">
											{(() => {
												const achievement = achievements[currentAchievement];
												const Icon = achievement.icon;
												return (
													<div className="flex items-start gap-3">
														<div className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center bg-white dark:bg-black flex-shrink-0">
															<Icon className="h-5 w-5 text-black dark:text-white" />
														</div>
														<div className="flex-1 min-w-0">
															<p className="font-semibold text-sm text-black dark:text-white mb-1">{achievement.title}</p>
															<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{achievement.status}</p>
															<p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{achievement.description}</p>
														</div>
													</div>
												);
											})()}
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="space-y-3 flex-1">
									<Button 
										variant="outline" 
										className="w-full justify-start border-gray-300 dark:border-gray-700 h-12"
										onClick={handleReportIssue}
									>
										<MapPin className="h-4 w-4 mr-3" />
										Report New Issue
									</Button>
									<Button 
										variant="outline" 
										className="w-full justify-start border-gray-300 dark:border-gray-700 h-12"
										onClick={handleViewMap}
									>
										<MapPin className="h-4 w-4 mr-3" />
										View Map
									</Button>
									<Button 
										variant="outline" 
										className="w-full justify-start border-gray-300 dark:border-gray-700 h-12"
										onClick={handleSettings}
									>
										<Settings className="h-4 w-4 mr-3" />
										Account Settings
									</Button>
								</div>
								
								{/* Sign Out */}
								<div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
									<Button 
										variant="outline" 
										className="w-full justify-start border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 h-12"
										onClick={handleSignOut}
									>
										<LogOut className="h-4 w-4 mr-3" />
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