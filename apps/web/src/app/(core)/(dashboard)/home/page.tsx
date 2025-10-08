"use client";

import { eden } from "@web/lib/eden";
<<<<<<< HEAD
import { createClient } from "@web/lib/supabase/client";
=======
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
import { useEffect, useState } from "react";
import CreateExperienceCard from "./features/create-experience-card";
import Feed from "./features/feed";
import FeedHeader from "./features/feed-header";
import { useExperiences } from "@web/hooks/use-experiences";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@web/context/SearchContext";
<<<<<<< HEAD
=======
import { ExperiencesProvider } from "@web/context/ExperiencesContext";
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187

export default function HomePage() {
	const [activeTab, setActiveTab] = useState<"for-you" | "communities">("for-you");
	const [searchTerm, setSearchTerm] = useState("");
<<<<<<< HEAD
	const [isSearching, setIsSearching] = useState(false);
=======
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const { setSearchHandler, setSearchChangeHandler, setCategoryFilterHandler } = useSearch();

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

	// Client-side search filtering function
	const filterExperiences = (experiences: any[], searchTerm: string, categoryFilter?: string | null) => {
		let filtered = experiences;
		
		// Apply category filter first
		if (categoryFilter) {
			filtered = filtered.filter(experience => 
				experience.category?.name?.toLowerCase() === categoryFilter.toLowerCase()
			);
		}
		
		// Then apply search filter
		if (!searchTerm.trim()) return filtered;
		
		const term = searchTerm.toLowerCase();
		return filtered.filter(experience => {
			// Search in title
			if (experience.title?.toLowerCase().includes(term)) return true;
			
			// Search in description
			if (experience.description?.toLowerCase().includes(term)) return true;
			
			// Search in category name
			if (experience.category?.name?.toLowerCase().includes(term)) return true;
			
			// Search in address
			if (experience.address?.toLowerCase().includes(term)) return true;
			
			// Search in user name
			if (experience.reportedBy?.name?.toLowerCase().includes(term)) return true;
			
			return false;
		});
	};

	const handleSearchChange = (term: string) => {
		setSearchTerm(term);
<<<<<<< HEAD
		setIsSearching(term.length > 0);
=======
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
	};

	const clearSearch = () => {
		setSearchTerm("");
<<<<<<< HEAD
		setIsSearching(false);
=======
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
	};

	const handleCategoryFilter = (categoryName: string) => {
		setSelectedCategory(categoryName);
		// Clear search when filtering by category
		setSearchTerm("");
<<<<<<< HEAD
		setIsSearching(false);
=======
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
	};

	const clearCategoryFilter = () => {
		setSelectedCategory(null);
	};

	// Set the search handlers when component mounts
	useEffect(() => {
		setSearchHandler(handleSearchChange);
		setSearchChangeHandler(handleSearchChange);
		setCategoryFilterHandler(handleCategoryFilter);
	}, [setSearchHandler, setSearchChangeHandler, setCategoryFilterHandler]);

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

	// Determine which experiences to show
	const baseExperiences = activeTab === "communities" 
		? experiences.filter(exp => exp.category?.name !== "Personal") // Example filter for communities
		: experiences;

<<<<<<< HEAD
	const displayExperiences = filterExperiences(baseExperiences, searchTerm, selectedCategory);

	return (
		<div>
			<FeedHeader onTabChange={handleTabChange} />
			<div className="px-4 lg:px-6">
				<CreateExperienceCard categoryOptions={categoryOptions} />
				<div className="border-t border-gray-200">
					{searchTerm ? (
=======
	const filteredExperiences = filterExperiences(baseExperiences, searchTerm, selectedCategory);
	
	// Sort by community engagement (cosigns) to prioritize validated concerns
	const displayExperiences = filteredExperiences.sort((a, b) => {
		const aUpvotes = a.upvotes || 0;
		const bUpvotes = b.upvotes || 0;
		
		// Prioritize posts with high engagement first
		if (aUpvotes !== bUpvotes) {
			return bUpvotes - aUpvotes;
		}
		
		// Then by recency
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	return (
		<ExperiencesProvider 
			experiences={experiences} 
			isLoading={experiencesLoading} 
			error={experiencesError ? "Something went wrong. Please try refreshing the page." : null}
		>
			<div>
				<FeedHeader onTabChange={handleTabChange} />
				<div className="px-4 lg:px-6">
					<CreateExperienceCard categoryOptions={categoryOptions} />
					<div className="border-t border-gray-200">
						{searchTerm ? (
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
						<div>
							{/* Search Results Header */}
							<div className="p-4 border-b border-gray-200 bg-gray-50">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold text-black">Search Results</h3>
										<p className="text-sm text-gray-600">
											{displayExperiences.length === 0 ? `No experiences found for "${searchTerm}"` :
											 `Found ${displayExperiences.length} experience${displayExperiences.length === 1 ? '' : 's'} for "${searchTerm}"`}
										</p>
									</div>
									<button
										onClick={clearSearch}
										className="text-sm text-gray-500 hover:text-gray-700 underline"
									>
										Clear search
									</button>
								</div>
							</div>
							{/* Search Results */}
							<Feed experiences={displayExperiences} />
						</div>
					) : selectedCategory ? (
						<div>
							{/* Category Filter Results Header */}
							<div className="p-4 border-b border-gray-200 bg-gray-50">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold text-black">Category: {selectedCategory}</h3>
										<p className="text-sm text-gray-600">
											{displayExperiences.length === 0 ? `No experiences found in "${selectedCategory}"` :
											 `Found ${displayExperiences.length} experience${displayExperiences.length === 1 ? '' : 's'} in "${selectedCategory}"`}
										</p>
									</div>
									<button
										onClick={clearCategoryFilter}
										className="text-sm text-gray-500 hover:text-gray-700 underline"
									>
										Clear filter
									</button>
								</div>
							</div>
							{/* Category Filter Results */}
							<Feed experiences={displayExperiences} />
						</div>
					) : activeTab === "communities" ? (
						<div className="p-8 text-center">
							<h3 className="text-lg font-semibold text-black mb-2">Communities</h3>
							<p className="text-gray-600 mb-4">Discover experiences from your local communities</p>
							<Feed experiences={displayExperiences} />
						</div>
					) : (
						<Feed experiences={displayExperiences} />
					)}
<<<<<<< HEAD
				</div>
			</div>
		</div>
=======
					</div>
				</div>
			</div>
		</ExperiencesProvider>
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
	);
}
