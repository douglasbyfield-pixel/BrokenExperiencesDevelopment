"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Wrench, DollarSign, Check, TrendingUp, Activity, Users, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	const user = session.user;
	const router = useRouter();
	const [userRoles, setUserRoles] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

	useEffect(() => {
		const fetchUserRoles = async () => {
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/roles`, {
					headers: {
						'Cookie': document.cookie
					}
				});
				if (response.ok) {
					const roles = await response.json();
					setUserRoles(roles);
				}
			} catch (error) {
				console.error('Failed to fetch user roles:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserRoles();
	}, []);

	const handleRoleSelection = async (role: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/roles/${role}`, {
				method: 'POST',
				headers: {
					'Cookie': document.cookie
				}
			});
			if (response.ok) {
				setUserRoles([...userRoles, role]);
				// Navigate to role-specific page
				if (role === 'reporter') router.push('/report');
				else if (role === 'fixer') router.push('/map');
			}
		} catch (error) {
			console.error('Failed to add role:', error);
		}
	};

	const upcomingFeatures = [
		{
			title: "Reporter",
			description: "Report community issues and track their resolution",
			icon: MapPin,
			color: "text-blue-500",
			bgColor: "bg-blue-100 dark:bg-blue-900/20",
			role: "reporter",
			route: "/report"
		},
		{
			title: "Fixer",
			description: "Volunteer to fix reported issues in your community",
			icon: Wrench,
			color: "text-green-500",
			bgColor: "bg-green-100 dark:bg-green-900/20",
			role: "fixer",
			route: "/map"
		},
		{
			title: "Sponsor",
			description: "Support community fixes with donations",
			icon: DollarSign,
			color: "text-purple-500",
			bgColor: "bg-purple-100 dark:bg-purple-900/20",
			role: "sponsor",
			route: "/sponsor"
		}
	];

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
				{/* Header Section */}
				<div className="mb-4 sm:mb-8 p-4 sm:p-8 bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
						<div>
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-black dark:text-white">
								Welcome back, {user.name}!
							</h1>
							<p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
								Start making a difference in your community
							</p>
						</div>
						
						<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
							<div className="text-center sm:text-right">
								<p className="font-semibold text-base sm:text-lg text-black dark:text-white">{user.name}</p>
								<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
								<div className="mt-1 flex items-center gap-1">
									<Award className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
									<span className="text-xs font-medium text-gray-600 dark:text-gray-400">Community Helper</span>
								</div>
							</div>
							<Avatar className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border-2 border-gray-300 dark:border-gray-700">
								<AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
								<AvatarFallback className="text-sm sm:text-base lg:text-lg font-bold bg-black dark:bg-white text-white dark:text-black">
									{initials}
								</AvatarFallback>
							</Avatar>
						</div>
					</div>
				</div>

				{/* Features Section */}
				<div className="mb-4 sm:mb-8">
					<div className="text-center mb-4 sm:mb-8">
						<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-black dark:text-white">Available Features</h2>
						<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Choose your role and start contributing to your community</p>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
						{upcomingFeatures.map((feature) => {
							const Icon = feature.icon;
							const hasRole = userRoles.includes(feature.role);
							
							return (
								<Card key={feature.title} className={`transition-all duration-200 hover:shadow-xl border-2 ${hasRole ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-black rounded-xl`}>
									<CardHeader className="p-6">
										<div className="flex items-start justify-between mb-4">
											<div className="w-16 h-16 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
												<Icon className="h-8 w-8 text-black dark:text-white" />
											</div>
											{hasRole && (
												<div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1">
													<Check className="h-3 w-3" />
													Active
												</div>
											)}
										</div>
										<CardTitle className="text-xl font-bold text-black dark:text-white mb-2">{feature.title}</CardTitle>
										<CardDescription className="text-gray-600 dark:text-gray-400">{feature.description}</CardDescription>
									</CardHeader>
									<CardContent className="p-4 sm:p-6 pt-0">
										{hasRole ? (
											<Button 
												className="w-full h-10 sm:h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base" 
												onClick={() => router.push(feature.route as any)}
											>
												Go to {feature.title}
											</Button>
										) : (
											<Button 
												variant="outline" 
												className="w-full h-10 sm:h-12 font-medium border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-200 text-sm sm:text-base"
												onClick={() => handleRoleSelection(feature.role)}
												disabled={loading}
											>
												Get Started
											</Button>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>

				{/* Impact Section */}
				<Card className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl shadow-lg">
					<CardHeader className="p-4 sm:p-8">
						<div className="text-center">
							<div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
								<TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-black dark:text-white" />
							</div>
							<CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-2">Your Impact</CardTitle>
							<CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
								Track your contributions to the Jamaica community
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="p-4 sm:p-8 pt-0 space-y-4 sm:space-y-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
							<div className="p-6 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl text-center">
								<div className="w-12 h-12 mx-auto mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
									<MapPin className="h-6 w-6 text-black dark:text-white" />
								</div>
								<p className="text-3xl font-bold text-black dark:text-white mb-1">5</p>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Reported</p>
							</div>
							<div className="p-6 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl text-center">
								<div className="w-12 h-12 mx-auto mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
									<Wrench className="h-6 w-6 text-black dark:text-white" />
								</div>
								<p className="text-3xl font-bold text-black dark:text-white mb-1">3</p>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues Fixed</p>
							</div>
							<div className="p-6 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl text-center">
								<div className="w-12 h-12 mx-auto mb-4 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
									<DollarSign className="h-6 w-6 text-black dark:text-white" />
								</div>
								<p className="text-3xl font-bold text-black dark:text-white mb-1">$250</p>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sponsored</p>
							</div>
						</div>
						
						{/* Community Stats */}
						<div className="p-6 border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 rounded-xl">
							<div className="text-center mb-6">
								<div className="w-12 h-12 mx-auto mb-3 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-xl flex items-center justify-center">
									<Users className="h-6 w-6 text-black dark:text-white" />
								</div>
								<h3 className="text-xl font-bold text-black dark:text-white">Community Impact</h3>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
								<div>
									<p className="text-2xl font-bold text-black dark:text-white mb-1">1,247</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">Total Issues</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-black dark:text-white mb-1">892</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">Resolved</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-black dark:text-white mb-1">2,156</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">Active Users</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-black dark:text-white mb-1">$12,450</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">Total Raised</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
