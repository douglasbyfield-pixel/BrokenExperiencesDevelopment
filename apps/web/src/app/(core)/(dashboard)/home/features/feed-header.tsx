"use client";

interface FeedHeaderProps {
	onTabChange?: (tab: "for-you" | "communities") => void;
}

export default function FeedHeader({ onTabChange }: FeedHeaderProps) {
	// Keep the interface for backward compatibility, but no longer use tab functionality

	return (
		<div className="border-gray-100 border-b bg-white">
			<div className="px-4 py-6">
			<div className="max-w-2xl">
				<h1 className="mb-2 font-bold text-2xl text-black">Community Feed</h1>
			</div>
			</div>
		</div>
	);
}
