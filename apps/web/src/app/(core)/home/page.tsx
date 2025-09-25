import Link from "next/link";
import { MapPin, PlusCircle, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
			{/* Hero Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
				<div className="text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
						Welcome to <br />
						<span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
							Broken Experiences
						</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up">
						Share and discover community issues. Together, we can make our neighborhoods better.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3">
							<Link href="/report">
								<PlusCircle className="w-5 h-5 mr-2" />
								Report an Issue
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white px-8 py-3">
							<Link href="/map">
								<MapPin className="w-5 h-5 mr-2" />
								Explore Map
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Features Grid */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Report Issues Card */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
						<div className="bg-black rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
							<AlertTriangle className="w-8 h-8 text-white" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Report Issues</h3>
						<p className="text-gray-600 mb-6 leading-relaxed">
							Share problems you've encountered in your area. Help build a comprehensive database of community issues.
						</p>
						<Link 
							href="/report" 
							className="text-black font-semibold hover:underline inline-flex items-center group-hover:translate-x-2 transition-transform duration-300"
						>
							Get Started →
						</Link>
					</div>

					{/* Explore Map Card */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
						<div className="bg-black rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
							<MapPin className="w-8 h-8 text-white" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Explore Map</h3>
						<p className="text-gray-600 mb-6 leading-relaxed">
							Discover issues reported by others nearby. Get real-time updates on community problems and their status.
						</p>
						<Link 
							href="/map" 
							className="text-black font-semibold hover:underline inline-flex items-center group-hover:translate-x-2 transition-transform duration-300"
						>
							View Map →
						</Link>
					</div>

					{/* Profile Card */}
					<div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
						<div className="bg-black rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
							<User className="w-8 h-8 text-white" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Your Profile</h3>
						<p className="text-gray-600 mb-6 leading-relaxed">
							Manage your account, track your contributions, and see how you're helping improve the community.
						</p>
						<Link 
							href="/profile" 
							className="text-black font-semibold hover:underline inline-flex items-center group-hover:translate-x-2 transition-transform duration-300"
						>
							View Profile →
						</Link>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className="bg-black text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4">Community Impact</h2>
						<p className="text-gray-300 text-lg">Together we're making a difference</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="text-4xl font-bold text-white mb-2">0</div>
							<div className="text-gray-300">Issues Reported</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-white mb-2">0</div>
							<div className="text-gray-300">Issues Resolved</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-white mb-2">0</div>
							<div className="text-gray-300">Active Users</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
