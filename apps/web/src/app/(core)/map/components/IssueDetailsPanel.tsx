import { Button } from "@web/components/ui/button";
import { MapPin, Route, Share2, X } from "lucide-react";

interface IssueDetailsPanelProps {
  experience: any;
  isNavigating: boolean;
  onClose: () => void;
  onVote: (experienceId: string) => void;
  onGetDirections: () => void;
  onClearRoute: () => void;
  onCopyLink: () => void;
}

export function IssueDetailsPanel({
  experience,
  isNavigating,
  onClose,
  onVote,
  onGetDirections,
  onClearRoute,
  onCopyLink,
}: IssueDetailsPanelProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="absolute right-4 bottom-4 left-4 z-20 mx-auto max-w-md rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-lg">
            {experience.title}
          </h3>
          <p className="mb-2 text-gray-600 text-sm dark:text-gray-400">
            {experience.description}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {experience.address && (
        <p className="mb-3 flex items-center gap-1 text-gray-500 text-xs">
          <MapPin className="h-3 w-3" />
          {experience.address}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 text-gray-700 transition-colors hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              onVote(experience.id);
            }}
          >
            {/* Vote functionality can be added here */}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isNavigating ? "default" : "outline"}
            onClick={isNavigating ? onClearRoute : onGetDirections}
          >
            <Route className="mr-1 h-3 w-3" />
            {isNavigating ? "Clear Route" : "Get Directions"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCopyLink}
          >
            <Share2 className="mr-1 h-3 w-3" />
            Share
          </Button>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 text-gray-500 text-xs">
        Reported {formatDate(experience.createdAt)}
        {experience.status === 'resolved' && (
          <span className="ml-2">
            • Resolved
          </span>
        )}
      </div>
    </div>
  );
}
