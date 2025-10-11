"use client";

import { Button } from "@web/components/ui/button";
import { Box, Layers3 } from "lucide-react";

interface MapToggleProps {
  is3D: boolean;
  onToggle: (is3D: boolean) => void;
}

export const MapToggle = ({ is3D, onToggle }: MapToggleProps) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        onClick={() => onToggle(!is3D)}
        variant="outline"
        size="sm"
        className={`bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white transition-all duration-200 ${
          is3D ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700'
        }`}
      >
        {is3D ? (
          <>
            <Layers3 size={16} className="mr-2" />
            3D
          </>
        ) : (
          <>
            <Box size={16} className="mr-2" />
            2D
          </>
        )}
      </Button>
    </div>
  );
};