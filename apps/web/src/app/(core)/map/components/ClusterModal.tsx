import { Button } from "@web/components/ui/button";
import { getCategoryStyling } from "@web/lib/category-config";
import { X } from "lucide-react";

interface ClusterModalProps {
	cluster: any[];
	onClose: () => void;
	onExperienceClick: (experience: any) => void;
}

export function ClusterModal({
	cluster,
	onClose,
	onExperienceClick,
}: ClusterModalProps) {
	return (
		<div className="absolute right-4 bottom-4 left-4 z-20 mx-auto max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-semibold text-lg">
					{cluster.length} Issues in this area
				</h3>
				<Button
					size="icon"
					variant="ghost"
					onClick={onClose}
					className="shrink-0"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<div className="max-h-64 space-y-2 overflow-y-auto">
				{cluster.map((experience) => {
					const categoryName = experience.category?.name || "Other";
					const categoryStyling = getCategoryStyling(categoryName);
					const IconComponent = categoryStyling.icon;

					return (
						<div
							key={experience.id}
							className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
							onClick={() => onExperienceClick(experience)}
						>
							<div
								className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
								style={{ backgroundColor: categoryStyling.color }}
							>
								<IconComponent className="h-4 w-4 text-white" />
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="truncate font-medium text-sm">
									{experience.title}
								</h4>
								<p className="truncate text-gray-600 text-xs dark:text-gray-400">
									{experience.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
