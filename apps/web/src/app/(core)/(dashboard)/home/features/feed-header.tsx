"use client";

interface FeedHeaderProps {
	onTabChange?: (tab: "for-you" | "communities") => void;
}

export default function FeedHeader({ onTabChange }: FeedHeaderProps) {
	// Keep the interface for backward compatibility, but no longer use tab functionality

	return (
		<div className="sticky top-16 lg:top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
			<div className="px-4 py-4">
				<div className="flex items-center gap-3">
					<div>
						<h1 className="text-xl font-bold text-gray-900">
							Experiences Near You
						</h1>
						<p className="text-sm text-gray-500 mt-1">
							Discover what's happening in your area
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
