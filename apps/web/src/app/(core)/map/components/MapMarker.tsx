import { getCategoryStyling } from "@web/lib/category-config";

interface MapMarkerProps {
  experience: any;
  onClick: (experience: any) => void;
}

export function MapMarker({ experience, onClick }: MapMarkerProps) {
  const categoryName = experience.category?.name || 'Other';
  const categoryStyling = getCategoryStyling(categoryName);
  const IconComponent = categoryStyling.icon;

  return (
    <div 
      className="custom-marker cursor-pointer transform hover:scale-110 transition-all duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onClick(experience);
      }}
    >
      <div 
        className="relative drop-shadow-lg w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-2xl"
        style={{ backgroundColor: categoryStyling.color }}
      >
        <IconComponent className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}
