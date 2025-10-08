import { Button } from "@web/components/ui/button";
import { Navigation, Search, Timer, Compass, MapPin, X } from "lucide-react";

interface QuickActionsPanelProps {
  userLocation: { lat: number; lng: number } | null;
  filteredExperiences: any[];
  map: any;
  onFindNearest: () => void;
  onSearchIssues: () => void;
  onRecentIssues: () => void;
  onMyLocation: () => void;
  onShowAll: () => void;
  onClose: () => void;
}

export function QuickActionsPanel({
  userLocation,
  filteredExperiences,
  map,
  onFindNearest,
  onSearchIssues,
  onRecentIssues,
  onMyLocation,
  onShowAll,
  onClose,
}: QuickActionsPanelProps) {
  return (
    <div
      className="absolute top-4 right-4 left-4 z-20 max-w-sm rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900"
      data-quick-actions-panel
    >
      <div className="mb-3 flex items-center gap-2">
        <Compass className="h-4 w-4 text-blue-500" />
        <h3 className="font-semibold text-sm">Quick Actions</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="ml-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
          onClick={onFindNearest}
          disabled={!userLocation || filteredExperiences.length === 0}
        >
          <Navigation className="h-4 w-4" />
          <span>Find Nearest</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
          onClick={onSearchIssues}
        >
          <Search className="h-4 w-4" />
          <span>Search Issues</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
          onClick={onRecentIssues}
        >
          <Timer className="h-4 w-4" />
          <span>Recent Issues</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
          onClick={onMyLocation}
          disabled={!userLocation || !map}
        >
          <Compass className="h-4 w-4" />
          <span>My Location</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="flex h-auto flex-col items-center gap-1 p-3 text-xs"
          onClick={onShowAll}
          disabled={filteredExperiences.length === 0 || !map}
        >
          <MapPin className="h-4 w-4" />
          <span>Show All ({filteredExperiences.length})</span>
        </Button>
      </div>
    </div>
  );
}
