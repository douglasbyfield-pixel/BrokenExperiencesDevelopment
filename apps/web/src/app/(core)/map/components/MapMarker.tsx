import { getCategoryStyling } from "@web/lib/category-config";

interface MapMarkerProps {
	experience: any;
	onClick: (experience: any) => void;
}

export function MapMarker({ experience, onClick }: MapMarkerProps) {
	const categoryName = experience.category?.name || "Other";
	const categoryStyling = getCategoryStyling(categoryName);
	const IconComponent = categoryStyling.icon;

	return (
		<div
			className="custom-marker transform cursor-pointer transition-all duration-200 hover:scale-110"
			onClick={(e) => {
				e.stopPropagation();
				onClick(experience);
			}}
		>
			<div
				className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-2xl drop-shadow-lg"
				style={{ backgroundColor: categoryStyling.color }}
			>
				<IconComponent className="h-5 w-5 text-white" />
			</div>
		</div>
	);
}
