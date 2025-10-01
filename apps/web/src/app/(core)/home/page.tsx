"use client";

import { eden } from "@web/lib/eden";
import { createClient } from "@web/lib/supabase/client";
import { useEffect, useState } from "react";
import CreateExperienceCard from "./features/create-experience-card";
import Feed from "./features/feed";
import FeedHeader from "./features/feed-header";
import MobileNav from "./features/mobile-nav";
import { useExperiences } from "@web/hooks/use-experiences";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
	const [activeTab, setActiveTab] = useState<"for-you" | "communities">("for-you");

	// Use TanStack Query for experiences - much faster with caching!
	const { 
		data: experiences = [], 
		isLoading: experiencesLoading, 
		error: experiencesError 
	} = useExperiences();

	// Use TanStack Query for categories
	const { 
		data: categoryOptions = [], 
		isLoading: categoriesLoading 
	} = useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			console.log('📂 Fetching categories with TanStack Query...');
			const result = await eden.category.get({ $query: { limit: 50, offset: 0 } });
			return Array.isArray(result?.data) ? result.data : [];
		},
		staleTime: 10 * 60 * 1000, // Cache categories for 10 minutes
		gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
	});

	const loading = experiencesLoading || categoriesLoading;
	const error = experiencesError ? "Something went wrong. Please try refreshing the page." : null;

	const handleTabChange = (tab: "for-you" | "communities") => {
		setActiveTab(tab);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-black">Loading...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-black mb-2">Something went wrong</h2>
					<p className="text-gray-600">{error}</p>
				</div>
			</div>
		);
	}

	const filteredExperiences = activeTab === "communities" 
		? experiences.filter(exp => exp.category?.name !== "Personal") // Example filter for communities
		: experiences;

	return (
		<div className="min-h-screen">
			<MobileNav />
			<FeedHeader onTabChange={handleTabChange} />
			<CreateExperienceCard categoryOptions={categoryOptions} />
			<div className="border-t border-gray-200">
				{activeTab === "communities" ? (
					<div className="p-8 text-center">
						<h3 className="text-lg font-semibold text-black mb-2">Communities</h3>
						<p className="text-gray-600 mb-4">Discover experiences from your local communities</p>
						<Feed experiences={filteredExperiences} />
					</div>
				) : (
					<Feed experiences={filteredExperiences} />
				)}
			</div>
		</div>
	);
}
