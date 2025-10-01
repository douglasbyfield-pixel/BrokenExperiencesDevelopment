"use client";

import { Input } from "@web/components/ui/input";
import { eden } from "@web/lib/eden";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchInput() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const router = useRouter();

	const handleSearch = async (term: string) => {
		if (!term.trim()) return;
		
		setIsSearching(true);
		try {
			// For now, we'll just navigate to a search results page
			// Later we can implement live search results
			const searchParams = new URLSearchParams({ q: term });
			router.push(`/search?${searchParams.toString()}`);
		} catch (error) {
			console.error("Search failed:", error);
		} finally {
			setIsSearching(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch(searchTerm);
		}
	};

	return (
		<div className="relative">
			<svg className="absolute left-4 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<Input
				placeholder="Search experiences"
				className="rounded-full border-gray-200 bg-gray-50 pl-12 pr-4 py-2 focus:bg-white focus:border-gray-300 text-black placeholder:text-gray-400"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={isSearching}
			/>
		</div>
	);
}