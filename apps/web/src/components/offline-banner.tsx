"use client";

import { WifiOff, X } from "lucide-react";
import { useState } from "react";

export default function OfflineBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Check if offline on each render
  const isOffline = !navigator.onLine;

  if (!isOffline || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>You're currently offline. Some features may not work properly.</span>
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-2 hover:bg-red-700 rounded p-1 transition-colors"
          aria-label="Dismiss offline banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
