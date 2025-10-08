import { Button } from "@web/components/ui/button";
import { Navigation, ChevronUp, ChevronDown, X } from "lucide-react";

interface NavigationPanelProps {
  currentRoute: any;
  navPanelMinimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onClearRoute: () => void;
}

export function NavigationPanel({
  currentRoute,
  navPanelMinimized,
  onMinimize,
  onExpand,
  onClearRoute,
}: NavigationPanelProps) {
  if (navPanelMinimized) {
    return (
      <div className="absolute right-4 bottom-4 z-20 w-48 rounded-lg bg-white shadow-lg transition-all duration-300 dark:bg-gray-900">
        <div className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">
                {(currentRoute.distance / 1000).toFixed(1)} km •{" "}
                {Math.round(currentRoute.duration / 60)} min
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={onExpand}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={onClearRoute}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {currentRoute.legs?.[0]?.steps?.[0] && (
            <div className="truncate text-gray-600 text-xs dark:text-gray-400">
              Next:{" "}
              {currentRoute.legs[0].steps[0].maneuver?.instruction ||
                "Continue straight"}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-4 bottom-4 z-20 w-80 rounded-lg bg-white shadow-lg transition-all duration-300 dark:bg-gray-900">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-sm">Navigation</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onMinimize}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onClearRoute}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm dark:text-gray-400">
              Distance:
            </span>
            <span className="font-medium text-sm">
              {(currentRoute.distance / 1000).toFixed(1)} km
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm dark:text-gray-400">
              Duration:
            </span>
            <span className="font-medium text-sm">
              {Math.round(currentRoute.duration / 60)} min
            </span>
          </div>
        </div>

        <div className="max-h-32 space-y-1 overflow-y-auto">
          {currentRoute.legs?.[0]?.steps
            ?.slice(0, 5)
            .map((step: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded bg-gray-50 p-2 text-xs dark:bg-gray-800"
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600 text-xs dark:bg-blue-900 dark:text-blue-400">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                  {step.maneuver?.instruction || "Continue straight"}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
