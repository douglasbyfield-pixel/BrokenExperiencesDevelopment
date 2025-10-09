import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { getCategoryStyling } from "@web/lib/category-config";
import { Info, Search, X } from "lucide-react";

interface SearchPanelProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	showLegend: boolean;
	setShowLegend: (show: boolean) => void;
	showFilters: boolean;
	setShowFilters: (show: boolean) => void;
	activeFilters: {
		status: string[];
		priority: string[];
		category: string[];
	};
	toggleFilter: (
		type: "status" | "priority" | "category",
		value: string,
	) => void;
	categories: Array<{ id: string; name: string }>;
	filteredExperiences: any[];
	onExperienceClick: (experience: any) => void;
	onClose: () => void;
}

const statusConfig = {
	pending: {
		icon: "AlertCircle",
		color: "#ef4444",
		label: "Reported",
	},
	in_progress: {
		icon: "Clock",
		color: "#f59e0b",
		label: "In Progress",
	},
	resolved: {
		icon: "CheckCircle",
		color: "#10b981",
		label: "Resolved",
	},
};

export function SearchPanel({
	searchQuery,
	setSearchQuery,
	showLegend,
	setShowLegend,
	showFilters,
	setShowFilters,
	activeFilters,
	toggleFilter,
	categories,
	filteredExperiences,
	onExperienceClick,
	onClose,
}: SearchPanelProps) {
	return (
		<div
			className="absolute top-4 right-4 left-4 z-20 max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900"
			data-search-panel
		>
			<div className="mb-3 flex items-center gap-2">
				<div className="relative flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
					<Input
						placeholder="Search issues..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
						autoFocus
					/>
				</div>
				<Button size="icon" variant="ghost" onClick={onClose}>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{/* Quick Filters */}
			<div className="mb-3 flex flex-wrap gap-2">
				<Button
					size="sm"
					variant={showLegend ? "default" : "outline"}
					onClick={() => setShowLegend(!showLegend)}
					className="text-xs"
				>
					<Info className="mr-1 h-3 w-3" />
					Legend
				</Button>
			</div>

			{/* Advanced Filters */}
			{showFilters && (
				<div className="mb-4 space-y-3">
					<div>
						<h4 className="mb-2 font-medium text-sm">Status</h4>
						<div className="flex flex-wrap gap-2">
							{Object.entries(statusConfig).map(([status, config]) => (
								<Button
									key={status}
									size="sm"
									variant={
										activeFilters.status.includes(status)
											? "default"
											: "outline"
									}
									onClick={() => toggleFilter("status", status)}
									className="text-xs"
								>
									{config.label}
								</Button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Legend */}
			{showLegend && (
				<div className="mb-4 space-y-2">
					<h4 className="font-medium text-sm">Map Legend</h4>
					<div className="grid grid-cols-2 gap-2 text-xs">
						{categories.map((category) => {
							const styling = getCategoryStyling(category.name);
							const IconComponent = styling.icon;
							return (
								<div key={category.id} className="flex items-center gap-2">
									<div
										className="flex h-4 w-4 items-center justify-center rounded-full"
										style={{ backgroundColor: styling.color }}
									>
										<IconComponent className="h-2 w-2 text-white" />
									</div>
									<span className="text-gray-600 dark:text-gray-400">
										{category.name}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Search Results */}
			{searchQuery && (
				<div className="max-h-48 overflow-y-auto">
					<h4 className="mb-2 font-medium text-sm">
						Results ({filteredExperiences.length})
					</h4>
					{filteredExperiences.slice(0, 5).map((experience) => (
						<div
							key={experience.id}
							className="cursor-pointer rounded border-b p-2 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
							onClick={() => onExperienceClick(experience)}
						>
							<h5 className="font-medium text-sm">{experience.title}</h5>
							<p className="truncate text-gray-600 text-xs dark:text-gray-400">
								{experience.description}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
