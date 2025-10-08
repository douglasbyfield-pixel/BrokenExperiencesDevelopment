"use client";

import { WifiOff, X } from "lucide-react";
import { useState } from "react";

export default function OfflineBanner() {
  // Check if offline on each render
  const isOffline = !navigator.onLine;

  if (!isOffline) {
    return null;
  }

  return (
    <div className="w-screen z-50 bg-red-600 text-white px-4 py-1 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">You're currently offline. Some features may not work properly.</span>
       
      </div>
    </div>
  );
}
