"use client";

import { BackButton } from "@web/components/ui/back-button";
import {
	useExperiences,
	useSearchExperiences,
} from "@web/hooks/use-experiences";
import type { Experience } from "@web/types";
import { Clock, MapPin, Search, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import ExperienceCard from "../home/features/experience-card";

type TabType = "new" | "trending" | "nearby";

function SearchBar({
	searchTerm,
	onSearchChange,
}: {
	searchTerm: string;
	onSearchChange: (term: string) => void;
}) {
	return (
		<div className="relative">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400 sm:h-5 sm:w-5" />
			<input
				type="text"
				placeholder="Search experiences..."
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
				className="w-full rounded-full bg-gray-100 px-8 py-2.5 text-gray-900 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-10 sm:py-3 sm:text-base"
			/>
		</div>
	);
}

function TabButton({
	active,
	onClick,
	children,
	icon: Icon,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<button
			onClick={onClick}
			className={`relative flex-1 py-3 text-center font-medium transition-colors sm:py-4 ${
				active ? "text-blue-500" : "text-gray-500 hover:text-gray-700"
			}`}
		>
			<div className="flex items-center justify-center gap-1 sm:gap-2">
				<Icon className="h-3 w-3 sm:h-4 sm:w-4" />
				<span className="truncate text-xs sm:text-sm">{children}</span>
			</div>
			{active && (
				<div className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-500" />
			)}
		</button>
	);
}

function ExperienceFeed({
	experiences,
	loading,
	searchTerm,
}: {
	experiences: Experience[];
	loading: boolean;
	searchTerm: string;
}) {
	if (loading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="animate-pulse border-gray-200 border-b p-4">
						<div className="flex space-x-3">
							<div className="h-12 w-12 rounded-full bg-gray-200" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-1/4 rounded bg-gray-200" />
								<div className="h-6 w-full rounded bg-gray-200" />
								<div className="h-4 w-3/4 rounded bg-gray-200" />
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
				<p className="mt-2 text-gray-500 text-sm">
					Try different keywords or clear search to see all experiences
				</p>
			</div>
		);
	}

	if (experiences.length === 0 && !searchTerm) {
		return (
			<div className="p-8 text-center">
				<p className="text-gray-600">No experiences available</p>
				<p className="mt-2 text-gray-500 text-sm">
					Be the first to report an issue!
				</p>
			</div>
		);
	}

	return (
		<div>
			{searchTerm && (
				<div className="border-gray-200 border-b bg-gray-50 p-4">
					<p className="text-gray-600 text-sm">
						Found {experiences.length} result
						{experiences.length !== 1 ? "s" : ""} for "{searchTerm}"
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

	// Get all experiences when no search term, search results when there is a search term
	const { data: allExperiences = [], isLoading: isLoadingAll } =
		useExperiences();
	const { data: searchResults = [], isLoading: isLoadingSearch } =
		useSearchExperiences(searchTerm);

	// Use search results if there's a search term, otherwise show all experiences
	const experiences = searchTerm ? searchResults : allExperiences;
	const isLoading = searchTerm ? isLoadingSearch : isLoadingAll;

	const tabs = [
		{ id: "new" as TabType, label: "Latest", icon: Clock },
		{ id: "trending" as TabType, label: "Trending", icon: TrendingUp },
		{ id: "nearby" as TabType, label: "Nearby", icon: MapPin },
	];

	// Sort experiences based on active tab
	const sortedExperiences = React.useMemo(() => {
		if (!experiences.length) return [];

		const sorted = [...experiences];

		switch (activeTab) {
			case "new":
				return sorted.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
			case "trending":
				return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
			case "nearby":
				// For now, just return newest - would need user location for proper nearby sorting
				return sorted.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
			default:
				return sorted;
		}
	}, [experiences, activeTab]);

	return (
		<>
			{/* Header */}
			<div className="sticky top-0 z-10 border-gray-200 border-b bg-white/80 backdrop-blur">
				<div className="flex items-center p-3 sm:p-4">
					<BackButton fallbackUrl="/home" className="mr-3 sm:mr-4" />
					<h1 className="font-semibold text-gray-900 text-lg sm:text-xl">
						Search
					</h1>
				</div>

				{/* Search Bar */}
				<div className="px-3 pb-3 sm:px-4 sm:pb-4">
					<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
				</div>

				{/* Navigation Tabs - Always show since we now display all experiences by default */}
				<div className="flex overflow-x-auto border-gray-200 border-b">
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
