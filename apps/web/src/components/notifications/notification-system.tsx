"use client";

import { useNotifications } from "./notification-provider";
import { useEffect } from "react";
import { useOfflineDetection } from "@web/hooks/use-offline-detection";

// Central notification system for app-wide notifications
export function NotificationSystem() {
  const { info, success, warning } = useNotifications();
  const { isOnline } = useOfflineDetection();

  // Example: Connection status notifications
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOnline = () => {
        success("You're back online!", "Connection Restored");
      };

      const handleOffline = () => {
        warning("You're offline. Some features may be limited.", "No Internet Connection");
      };

      if (isOnline === false) {
        handleOffline();
      } else if (isOnline === true) {
        // Only show "back online" if we were previously offline
        const wasOffline = sessionStorage.getItem("was-offline");
        if (wasOffline) {
          handleOnline();
          sessionStorage.removeItem("was-offline");
        }
      }

      // Track offline state for "back online" notifications
      if (!isOnline) {
        sessionStorage.setItem("was-offline", "true");
      }
    }
  }, [isOnline, success, warning]);

  return null; // This component doesn't render anything
}

// Utility functions for common notifications
export const notificationTemplates = {
  experienceCreated: (title: string) => ({
    title: "Experience Created!",
    message: `"${title}" has been successfully reported`,
    type: "success" as const,
  }),

  fixClaimed: (title: string) => ({
    title: "Fix Claimed!",
    message: `You've claimed the fix for "${title}"`,
    type: "success" as const,
  }),

  voteCast: (isEndorsement: boolean) => ({
    title: isEndorsement ? "Vote Cast!" : "Vote Removed",
    message: isEndorsement 
      ? "Your endorsement has been recorded" 
      : "Your endorsement has been removed",
    type: "success" as const,
  }),

  uploadComplete: (filename: string) => ({
    title: "Upload Complete!",
    message: `"${filename}" has been uploaded successfully`,
    type: "success" as const,
  }),

  actionQueued: (action: string) => ({
    title: "Action Queued",
    message: `${action} will be processed when you're back online`,
    type: "info" as const,
  }),

  syncComplete: (count: number) => ({
    title: "Sync Complete!",
    message: `${count} pending actions have been processed`,
    type: "success" as const,
  }),

  syncFailed: (count: number) => ({
    title: "Sync Failed",
    message: `${count} actions failed to sync. They will be retried later.`,
    type: "error" as const,
  }),

  locationPermissionNeeded: () => ({
    title: "Location Access Needed",
    message: "Please enable location access to find nearby issues",
    type: "warning" as const,
    action: {
      label: "Enable Location",
      onClick: () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(() => {
            window.location.reload();
          });
        }
      },
    },
  }),

  cameraPermissionNeeded: () => ({
    title: "Camera Access Needed",
    message: "Please allow camera access to take photos",
    type: "warning" as const,
    action: {
      label: "Try Again",
      onClick: () => window.location.reload(),
    },
  }),
};