"use client";

interface FeedHeaderProps {
	onTabChange?: (tab: "for-you" | "communities") => void;
}

export default function FeedHeader({ onTabChange }: FeedHeaderProps) {
	// Keep the interface for backward compatibility, but no longer use tab functionality

	return (
		<div className="bg-white border-b border-gray-100">
			<div className="px-4 py-6">
				<div className="max-w-2xl">
					<h1 className="text-2xl font-bold text-black mb-2">
						Community Feed
					</h1>
					<p className="text-gray-600 text-base leading-relaxed">
						Be the change your community needs. Every report matters, every voice counts.
					</p>
				</div>
			</div>
		</div>
	);
}
