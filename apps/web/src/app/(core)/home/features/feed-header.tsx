"use client";

import { useState } from "react";

interface FeedHeaderProps {
	onTabChange?: (tab: "for-you" | "communities") => void;
}

export default function FeedHeader({ onTabChange }: FeedHeaderProps) {
	const [activeTab, setActiveTab] = useState<"for-you" | "communities">("for-you");

	const handleTabChange = (tab: "for-you" | "communities") => {
		setActiveTab(tab);
		onTabChange?.(tab);
	};

	return (
		<div className="sticky top-16 lg:top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
			<div className="flex">
				<button
					type="button"
					onClick={() => handleTabChange("for-you")}
					className={`flex-1 py-3 lg:py-4 text-center font-medium text-sm lg:text-base transition-colors ${
						activeTab === "for-you"
							? "border-b-2 border-black font-semibold text-black"
							: "border-b border-gray-200 text-gray-600 hover:bg-gray-50"
					}`}
				>
					Experiences Near You
				</button>
				
			</div>
		</div>
	);
}
