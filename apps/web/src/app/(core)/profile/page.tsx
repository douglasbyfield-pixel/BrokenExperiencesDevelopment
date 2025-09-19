"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Award, TrendingUp, Wrench, DollarSign, Edit } from "lucide-react";

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
				}
			} catch (error) {
				console.error("Failed to fetch profile:", error);
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
			<div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
				{/* Profile Header */}
				<Card className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl shadow-lg mb-4 sm:mb-8">
					<CardContent className="p-4 sm:p-8">
						<div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
							<div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6">
								<Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-2 border-gray-300 dark:border-gray-700">
									<AvatarImage src={profile.image || undefined} alt={profile.name} />
									<AvatarFallback className="text-lg sm:text-xl lg:text-2xl font-bold bg-black dark:bg-white text-white dark:text-black">
										{initials}
									</AvatarFallback>
								</Avatar>
								
								<div className="text-center lg:text-left">
									<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-2">{profile.name}</h1>
									<p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-3">{profile.bio}</p>
									
									<div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
										<div className="flex items-center gap-1">
											<MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
											<span>{profile.location}</span>
										</div>
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
											<span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
										</div>
									</div>
									
									<div className="flex flex-wrap justify-center lg:justify-start gap-1 sm:gap-2">
										{profile.roles.map((role) => (
											<Badge key={role} variant="outline" className="capitalize text-xs">
												{role}
											</Badge>
										))}
									</div>
								</div>
							</div>
							
							<div className="lg:ml-auto w-full lg:w-auto">
								<Button variant="outline" className="w-full lg:w-auto text-sm">
									<Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
									Edit Profile
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
					<Card className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl text-center">
						<CardContent className="p-3 sm:p-6">
							<div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
								<MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black dark:text-white" />
							</div>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.issuesReported}</p>
							<p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Issues Reported</p>
						</CardContent>
					</Card>
					
					<Card className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl text-center">
						<CardContent className="p-3 sm:p-6">
							<div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
								<Wrench className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black dark:text-white" />
							</div>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.issuesFixed}</p>
							<p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Issues Fixed</p>
						</CardContent>
					</Card>
					
					<Card className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl text-center">
						<CardContent className="p-3 sm:p-6">
							<div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
								<DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black dark:text-white" />
							</div>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-1">${profile.stats.totalSponsored}</p>
							<p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Sponsored</p>
						</CardContent>
					</Card>
					
					<Card className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl text-center">
						<CardContent className="p-3 sm:p-6">
							<div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
								<Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black dark:text-white" />
							</div>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-1">{profile.stats.impactScore}</p>
							<p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Impact Score</p>
						</CardContent>
					</Card>
				</div>

				{/* Activity Section */}
				<Card className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl shadow-lg">
					<CardHeader className="p-4 sm:p-6">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
								<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black dark:text-white" />
							</div>
							<div>
								<CardTitle className="text-lg sm:text-xl font-bold text-black dark:text-white">Recent Activity</CardTitle>
								<CardDescription className="text-sm text-gray-600 dark:text-gray-400">
									Your latest contributions to the community
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-4 sm:p-6 pt-0">
						<div className="space-y-3 sm:space-y-4">
							<div className="p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 mb-2">
									<MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
									<span className="font-medium text-sm sm:text-base text-black dark:text-white">Reported an issue</span>
									<span className="text-xs sm:text-sm text-gray-500">2 days ago</span>
								</div>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Broken streetlight on Hope Road causing safety concerns
								</p>
							</div>
							
							<div className="p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 mb-2">
									<Wrench className="h-4 w-4 text-green-600" />
									<span className="font-medium text-black dark:text-white">Fixed an issue</span>
									<span className="text-sm text-gray-500">1 week ago</span>
								</div>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Repaired potholes on Spanish Town Road
								</p>
							</div>
							
							<div className="p-3 sm:p-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 mb-2">
									<DollarSign className="h-4 w-4 text-purple-600" />
									<span className="font-medium text-black dark:text-white">Sponsored repair</span>
									<span className="text-sm text-gray-500">2 weeks ago</span>
								</div>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
									Contributed $50 to water main repair project
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}