"use client";

import { eden } from "@web/lib/eden";
import { useEffect, useState } from "react";
import CreateExperienceCard from "./features/create-experience-card";
import Feed from "./features/feed";
import FeedHeader from "./features/feed-header";
import MobileNav from "./features/mobile-nav";

export default function HomePage() {
	const [experiences, setExperiences] = useState<any[]>([]);
	const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
	const [activeTab, setActiveTab] = useState<"for-you" | "communities">("for-you");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [experiencesResult, categoryResult] = await Promise.all([
					eden.experience.get({ $query: {} }),
					eden.category.get({ $query: { limit: 50, offset: 0 } })
				]);

				setExperiences(experiencesResult?.data ?? []);
				setCategoryOptions(Array.isArray(categoryResult?.data) ? categoryResult.data : []);
			} catch (err) {
				console.error("Error loading home page:", err);
				setError("Something went wrong. Please try refreshing the page.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

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
