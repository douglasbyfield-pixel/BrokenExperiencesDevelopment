"use client";

import React, { useState } from "react";
import { useSearchExperiences } from "@web/hooks/use-experiences";
import { BackButton } from "@web/components/ui/back-button";
import { Search, MapPin, TrendingUp, Clock } from "lucide-react";
import ExperienceCard from "../home/features/experience-card";
import type { Experience } from "@web/types";


type TabType = "new" | "trending" | "nearby";

function SearchBar({ 
	searchTerm, 
	onSearchChange 
}: { 
	searchTerm: string; 
	onSearchChange: (term: string) => void;
}) {
	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
			<input
				type="text"
				placeholder="Search experiences..."
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
				className="w-full bg-gray-100 rounded-full px-8 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
			/>
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

function ExperienceFeed({ 
	experiences, 
	loading, 
	searchTerm 
}: { 
	experiences: Experience[]; 
	loading: boolean; 
	searchTerm: string;
}) {
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

	if (experiences.length === 0 && searchTerm) {
		return (
			<div className="p-8 text-center">
				<p className="text-gray-600">No experiences found for "{searchTerm}"</p>
				<p className="text-gray-500 text-sm mt-2">Try different keywords or browse all experiences</p>
			</div>
		);
	}

	if (experiences.length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-gray-600">No experiences found</p>
				<p className="text-gray-500 text-sm mt-2">Try searching for something or check back later</p>
			</div>
		);
	}

	return (
		<div>
			{searchTerm && (
				<div className="p-4 border-b border-gray-200 bg-gray-50">
					<p className="text-sm text-gray-600">
						Found {experiences.length} result{experiences.length !== 1 ? 's' : ''} for "{searchTerm}"
					</p>
				</div>
			)}
			{experiences.map((experience) => (
				<ExperienceCard key={experience.id} experience={experience} />
			))}
		</div>
	);
}

export default function SearchPage() {
	const [activeTab, setActiveTab] = useState<TabType>("new");
	const [searchTerm, setSearchTerm] = useState("");

	// Get experiences based on search term
	const { data: searchResults = [], isLoading } = useSearchExperiences(searchTerm);

	const tabs = [
		{ id: "new" as TabType, label: "Latest", icon: Clock },
		{ id: "trending" as TabType, label: "Trending", icon: TrendingUp },
		{ id: "nearby" as TabType, label: "Nearby", icon: MapPin },
	];

	// Sort experiences based on active tab
	const sortedExperiences = React.useMemo(() => {
		if (!searchResults.length) return [];
		
		const sorted = [...searchResults];
		
		switch (activeTab) {
			case "new":
				return sorted.sort((a, b) => 
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			case "trending":
				return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
			case "nearby":
				// For now, just return newest - would need user location for proper nearby sorting
				return sorted.sort((a, b) => 
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			default:
				return sorted;
		}
	}, [searchResults, activeTab]);

	return (
		<>
			{/* Header */}
			<div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
				<div className="flex items-center p-3 sm:p-4">
					<BackButton fallbackUrl="/home" className="mr-3 sm:mr-4" />
					<h1 className="text-lg sm:text-xl font-semibold text-gray-900">Search</h1>
				</div>
				
				{/* Search Bar */}
				<div className="px-3 sm:px-4 pb-3 sm:pb-4">
					<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
				</div>
				
				{/* Navigation Tabs - Only show if we have search results */}
				{searchTerm && (
					<div className="flex border-b border-gray-200 overflow-x-auto">
						{tabs.map((tab) => (
							<TabButton
								key={tab.id}
								active={activeTab === tab.id}
								onClick={() => setActiveTab(tab.id)}
								icon={tab.icon}
							>
								{tab.label}
							</TabButton>
						))}
					</div>
				)}
			</div>

			{/* Content */}
			<div className="bg-white">
				<ExperienceFeed 
					experiences={sortedExperiences} 
					loading={isLoading} 
					searchTerm={searchTerm}
				/>
			</div>
		</>
	);
}