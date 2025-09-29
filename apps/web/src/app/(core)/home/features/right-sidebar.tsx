import { Avatar, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { cn } from "@web/lib/utils";
import type { Stats } from "@web/types";

interface RightSidebarProps {
	className?: string;
	stats: Stats;
}

export default function RightSidebar({ className, stats }: RightSidebarProps) {
	return (
		<div
			className={cn(
				"lg:-ml-2 relative w-full shrink-0 bg-black lg:sticky lg:top-0 lg:max-h-dvh lg:w-[300px] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-2 [@media(min-width:1600px)]:w-[350px]",
				className,
			)}
		>
			<div className="space-y-6 p-2">
				{/* Search */}
				<div>
					<Input
						placeholder="Search"
						className="rounded-full border-gray-700 bg-gray-800 text-white placeholder:text-gray-400"
					/>
				</div>

				{/* Trending */}
				<Card className="border-gray-800 bg-black p-4">
					<h3 className="font-bold text-lg text-white">Statistics</h3>
					<div className="mt-4 space-y-3">
						<div className="space-y-1">
							<p className="text-gray-400 text-sm">Total Experiences</p>
							<p className="font-semibold text-white">{stats.totalExperiences}</p>
						</div>
						<div className="space-y-1">
							<p className="text-gray-400 text-sm">Resolved Experiences</p>
							<p className="font-semibold text-white">{stats.resolvedExperiences}</p>
						</div>
						<div className="space-y-1">
							<p className="text-gray-400 text-sm">Active Users</p>
							<p className="font-semibold text-white">{stats.activeUsers}</p>
						</div>
					</div>
				</Card>

				{/* Footer Links */}
				<div className="text-gray-500 text-xs">
					<p>
						Terms of Service | Privacy Policy | Cookie Policy | Accessibility |
						Ads info | More ... © 2025 Broken EXP Corp.
					</p>
				</div>
			</div>
		</div>
	);
}
