"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Award, TrendingUp, Wrench, DollarSign, Edit, Mail, Shield, Settings, LogOut, Camera } from "lucide-react";

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
										className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-white dark:border-black bg-white dark:bg-black"
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
											<h1 className="text-3xl font-bold text-black dark:text-white mb-2">{profile.name}</h1>
											<p className="text-gray-600 dark:text-gray-400 text-lg">{profile.bio}</p>
										</div>
										
										<div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
											<div className="flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												<span>{profile.location}</span>
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
										<Button variant="outline" className="border-gray-300 dark:border-gray-700">
											<Settings className="h-4 w-4 mr-2" />
											Settings
										</Button>
										<Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
											<Edit className="h-4 w-4 mr-2" />
											Edit Profile
										</Button>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Statistics */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 mx-auto mb-4 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
								<MapPin className="h-6 w-6 text-black dark:text-white" />
							</div>
							<p className="text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.issuesReported}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Issues Reported</p>
						</CardContent>
					</Card>
					
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 mx-auto mb-4 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
								<Wrench className="h-6 w-6 text-black dark:text-white" />
							</div>
							<p className="text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.issuesFixed}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Issues Resolved</p>
						</CardContent>
					</Card>
					
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 mx-auto mb-4 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
								<DollarSign className="h-6 w-6 text-black dark:text-white" />
							</div>
							<p className="text-3xl font-bold text-black dark:text-white mb-1">${profile.stats.totalSponsored}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Sponsored</p>
						</CardContent>
					</Card>
					
					<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
						<CardContent className="p-6 text-center">
							<div className="w-12 h-12 mx-auto mb-4 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
								<Award className="h-6 w-6 text-black dark:text-white" />
							</div>
							<p className="text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.impactScore}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Impact Score</p>
						</CardContent>
					</Card>
				</div>

				{/* Activity and Actions */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Activity Feed */}
					<div className="lg:col-span-3">
						<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
							<CardHeader className="border-b border-gray-200 dark:border-gray-800">
								<div className="flex items-center justify-between">
									<CardTitle className="text-xl font-bold text-black dark:text-white">Activity Timeline</CardTitle>
									<Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
										View All
									</Button>
								</div>
							</CardHeader>
							<CardContent className="p-0">
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

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Achievements */}
						<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
							<CardHeader>
								<CardTitle className="text-lg font-bold text-black dark:text-white">Achievements</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center bg-white dark:bg-black">
											<Award className="h-6 w-6 text-black dark:text-white" />
										</div>
										<div>
											<p className="font-medium text-black dark:text-white">First Report</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center bg-white dark:bg-black">
											<Shield className="h-6 w-6 text-black dark:text-white" />
										</div>
										<div>
											<p className="font-medium text-black dark:text-white">Community Guardian</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">Achieved</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center bg-white dark:bg-black">
											<TrendingUp className="h-6 w-6 text-black dark:text-white" />
										</div>
										<div>
											<p className="font-medium text-black dark:text-white">Rising Contributor</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
							<CardHeader>
								<CardTitle className="text-lg font-bold text-black dark:text-white">Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-700">
									<MapPin className="h-4 w-4 mr-2" />
									Report Issue
								</Button>
								<Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-700">
									<Settings className="h-4 w-4 mr-2" />
									Settings
								</Button>
								<Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400">
									<LogOut className="h-4 w-4 mr-2" />
									Sign Out
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}