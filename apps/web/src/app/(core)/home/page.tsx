import { AlertTriangle, MapPin, PlusCircle, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
			{/* Hero Section */}
			<div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
				<div className="text-center">
					<h1 className="mb-6 animate-fade-in font-bold text-4xl text-gray-900 md:text-6xl">
						Welcome to <br />
						<span className="bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
							Broken Experiences
						</span>
					</h1>
					<p className="mx-auto mb-8 max-w-2xl animate-slide-up text-gray-600 text-xl">
						Share and discover community issues. Together, we can make our
						neighborhoods better.
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button
							asChild
							size="lg"
							className="bg-black px-8 py-3 text-white hover:bg-gray-800"
						>
							<Link href="/report">
								<PlusCircle className="mr-2 h-5 w-5" />
								Report an Issue
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="border-black px-8 py-3 text-black hover:bg-black hover:text-white"
						>
							<Link href="/map">
								<MapPin className="mr-2 h-5 w-5" />
								Explore Map
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Features Grid */}
			<div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{/* Report Issues Card */}
					<div className="group hover:-translate-y-1 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
						<div className="mb-6 w-fit rounded-xl bg-black p-4 transition-transform duration-300 group-hover:scale-110">
							<AlertTriangle className="h-8 w-8 text-white" />
						</div>
						<h3 className="mb-4 font-bold text-2xl text-gray-900">
							Report Issues
						</h3>
						<p className="mb-6 text-gray-600 leading-relaxed">
							Share problems you've encountered in your area. Help build a
							comprehensive database of community issues.
						</p>
						<Link
							href="/report"
							className="inline-flex items-center font-semibold text-black transition-transform duration-300 hover:underline group-hover:translate-x-2"
						>
							Get Started →
						</Link>
					</div>

					{/* Explore Map Card */}
					<div className="group hover:-translate-y-1 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
						<div className="mb-6 w-fit rounded-xl bg-black p-4 transition-transform duration-300 group-hover:scale-110">
							<MapPin className="h-8 w-8 text-white" />
						</div>
						<h3 className="mb-4 font-bold text-2xl text-gray-900">
							Explore Map
						</h3>
						<p className="mb-6 text-gray-600 leading-relaxed">
							Discover issues reported by others nearby. Get real-time updates
							on community problems and their status.
						</p>
						<Link
							href="/map"
							className="inline-flex items-center font-semibold text-black transition-transform duration-300 hover:underline group-hover:translate-x-2"
						>
							View Map →
						</Link>
					</div>

					{/* Profile Card */}
					<div className="group hover:-translate-y-1 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
						<div className="mb-6 w-fit rounded-xl bg-black p-4 transition-transform duration-300 group-hover:scale-110">
							<User className="h-8 w-8 text-white" />
						</div>
						<h3 className="mb-4 font-bold text-2xl text-gray-900">
							Your Profile
						</h3>
						<p className="mb-6 text-gray-600 leading-relaxed">
							Manage your account, track your contributions, and see how you're
							helping improve the community.
						</p>
						<Link
							href="/profile"
							className="inline-flex items-center font-semibold text-black transition-transform duration-300 hover:underline group-hover:translate-x-2"
						>
							View Profile →
						</Link>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className="bg-black py-16 text-white">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl">Community Impact</h2>
						<p className="text-gray-300 text-lg">
							Together we're making a difference
						</p>
					</div>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div className="text-center">
							<div className="mb-2 font-bold text-4xl text-white">0</div>
							<div className="text-gray-300">Issues Reported</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-4xl text-white">0</div>
							<div className="text-gray-300">Issues Resolved</div>
						</div>
						<div className="text-center">
							<div className="mb-2 font-bold text-4xl text-white">0</div>
							<div className="text-gray-300">Active Users</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
