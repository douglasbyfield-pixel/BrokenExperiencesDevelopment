"use client";

interface FeedHeaderProps {
	onTabChange?: (tab: "for-you" | "communities") => void;
}

export default function FeedHeader({ onTabChange }: FeedHeaderProps) {
	// Keep the interface for backward compatibility, but no longer use tab functionality

	return (
<<<<<<< HEAD
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
=======
		<div className="bg-white border-b border-gray-100">
			<div className="px-4 py-6">
				<div className="max-w-2xl">
					<h1 className="text-2xl font-bold text-black mb-2">
						Community Feed
					</h1>
					<p className="text-gray-600 text-base leading-relaxed">
						Be the change your community needs. Every report matters, every voice counts.
					</p>
>>>>>>> 54abad9f86f69d9ecf0484366110fe35311ea187
				</div>
			</div>
		</div>
	);
}
