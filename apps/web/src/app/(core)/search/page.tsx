"use client";

import { useState, useEffect } from "react";
import { eden } from "@web/lib/eden";
import { BackButton } from "@web/components/ui/back-button";
import { Search, Settings, MapPin, TrendingUp, Clock, Calendar } from "lucide-react";
import ExperienceCard from "../home/features/experience-card";
import type { Experience } from "@web/types";

interface SearchPageProps {
	searchParams: Promise<{ q?: string }>;
}

type TabType = "nearby" | "trending" | "new" | "old";

function SearchBar() {
	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
			<input
				type="text"
				placeholder="Search experiences..."
				className="w-full bg-gray-100 rounded-full px-8 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
			/>
			<Settings className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-gray-600" />
		</div>
	);
}

function TabButton({ 
	active, 
	onClick, 
	children, 
	icon: Icon 
}: { 
	active: boolean; 
	onClick: () => void; 
	children: React.ReactNode;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<button
			onClick={onClick}
			className={`flex-1 py-3 sm:py-4 text-center font-medium transition-colors relative ${
				active 
					? "text-blue-500" 
					: "text-gray-500 hover:text-gray-700"
			}`}
		>
			<div className="flex items-center justify-center gap-1 sm:gap-2">
				<Icon className="w-3 h-3 sm:w-4 sm:h-4" />
				<span className="text-xs sm:text-sm truncate">{children}</span>
			</div>
			{active && (
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
			)}
		</button>
	);
}

function TrendingSection() {
	return (
		<div className="p-3 sm:p-4 border-b border-gray-200">
			<h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Trending in Your Area</h2>
			<div className="space-y-2 sm:space-y-3">
				<div className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
					<div className="flex-1 min-w-0">
						<p className="font-semibold text-gray-900 text-sm sm:text-base truncate">Traffic Issues</p>
						<p className="text-xs sm:text-sm text-gray-500 truncate">Highway 101 • 2.3K reports</p>
					</div>
					<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 ml-2" />
				</div>
				<div className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
					<div className="flex-1 min-w-0">
						<p className="font-semibold text-gray-900 text-sm sm:text-base truncate">Power Outages</p>
						<p className="text-xs sm:text-sm text-gray-500 truncate">Downtown • 1.8K reports</p>
					</div>
					<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 ml-2" />
				</div>
				<div className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
					<div className="flex-1 min-w-0">
						<p className="font-semibold text-gray-900 text-sm sm:text-base truncate">Road Construction</p>
						<p className="text-xs sm:text-sm text-gray-500 truncate">Main Street • 1.2K reports</p>
					</div>
					<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 ml-2" />
				</div>
			</div>
		</div>
	);
}

function NewsSection() {
	const newsItems = [
		{
			title: "City Council Approves New Infrastructure Budget",
			time: "2 hours ago",
			category: "Government",
			posts: "156K",
			image: "🏛️"
		},
		{
			title: "Major Road Closure Scheduled for Next Week",
			time: "4 hours ago", 
			category: "Transportation",
			posts: "89K",
			image: "🚧"
		},
		{
			title: "New Public Safety Initiative Launched",
			time: "6 hours ago",
			category: "Safety",
			posts: "234K",
			image: "🚨"
		}
	];

	return (
		<div className="p-3 sm:p-4 border-b border-gray-200">
			<h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Today's News</h2>
			<div className="space-y-2 sm:space-y-3">
				{newsItems.map((item, index) => (
					<div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
						<div className="text-xl sm:text-2xl flex-shrink-0">{item.image}</div>
						<div className="flex-1 min-w-0">
							<p className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{item.title}</p>
							<p className="text-xs sm:text-sm text-gray-500 mt-1">
								{item.time} • {item.category} • {item.posts} reports
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function ExperienceFeed({ experiences, loading }: { experiences: Experience[]; loading: boolean }) {
	if (loading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="border-b border-gray-200 p-4 animate-pulse">
						<div className="flex space-x-3">
							<div className="h-12 w-12 rounded-full bg-gray-200" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-gray-200 rounded w-1/4"></div>
								<div className="h-6 bg-gray-200 rounded w-full"></div>
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (experiences.length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-gray-600">No experiences found</p>
				<p className="text-gray-500 text-sm mt-2">Try a different tab or check back later</p>
			</div>
		);
	}

	return (
		<div>
			{experiences.map((experience) => (
				<ExperienceCard key={experience.id} experience={experience} />
			))}
		</div>
	);
}

export default function SearchPage({ searchParams }: SearchPageProps) {
	const [activeTab, setActiveTab] = useState<TabType>("nearby");
	const [experiences, setExperiences] = useState<Experience[]>([]);
	const [loading, setLoading] = useState(false);

	const tabs = [
		{ id: "nearby" as TabType, label: "Experiences Near You", icon: MapPin },
		{ id: "trending" as TabType, label: "Trending", icon: TrendingUp },
		{ id: "new" as TabType, label: "Newly Reported", icon: Clock },
		{ id: "old" as TabType, label: "Old", icon: Calendar },
	];

	const fetchExperiences = async (tab: TabType) => {
		setLoading(true);
		try {
			// This would be replaced with actual API calls based on the tab
			// For now, return empty array since we don't have proper mock data
			setExperiences([]);
		} catch (error) {
			console.error("Error fetching experiences:", error);
			setExperiences([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExperiences(activeTab);
	}, [activeTab]);

	return (
		<>
			{/* Header */}
			<div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
				<div className="flex items-center p-3 sm:p-4">
					<BackButton fallbackUrl="/home" className="mr-3 sm:mr-4" />
					<h1 className="text-lg sm:text-xl font-semibold text-gray-900">Explore</h1>
				</div>
				
				{/* Search Bar */}
				<div className="px-3 sm:px-4 pb-3 sm:pb-4">
					<SearchBar />
				</div>
				
				{/* Navigation Tabs */}
				<div className="flex border-b border-gray-200 overflow-x-auto">
					{tabs.map((tab) => (
						<TabButton
							key={tab.id}
							active={activeTab === tab.id}
							onClick={() => setActiveTab(tab.id)}
							icon={tab.icon}
						>
							<span className="hidden sm:inline">{tab.label}</span>
							<span className="sm:hidden">
								{tab.id === "nearby" ? "Nearby" : 
								 tab.id === "trending" ? "Trending" :
								 tab.id === "new" ? "New" : "Old"}
							</span>
						</TabButton>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="bg-white">
				{activeTab === "nearby" && <TrendingSection />}
				{activeTab === "trending" && <NewsSection />}
				<ExperienceFeed experiences={experiences} loading={loading} />
			</div>
		</>
	);
}