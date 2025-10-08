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
        <h3 className="font-semibold text-lg">{cluster.length} Issues in this area</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {cluster.map((experience) => {
          const categoryName = experience.category?.name || 'Other';
          const categoryStyling = getCategoryStyling(categoryName);
          const IconComponent = categoryStyling.icon;
          
          return (
            <div
              key={experience.id}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => onExperienceClick(experience)}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: categoryStyling.color }}
              >
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{experience.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{experience.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
