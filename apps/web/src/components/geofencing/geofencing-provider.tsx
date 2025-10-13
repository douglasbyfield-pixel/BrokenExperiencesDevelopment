"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { geofenceService, type GeofenceRegion, type UserLocation } from "@web/lib/geofencing/geofence-service";
import { useNotifications } from "@web/components/notifications";

interface GeofencingContextType {
  isTracking: boolean;
  currentLocation: UserLocation | null;
  permissionGranted: boolean;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  addRegion: (region: GeofenceRegion) => void;
  removeRegion: (regionId: string) => void;
  regions: GeofenceRegion[];
}

const GeofencingContext = createContext<GeofencingContextType | null>(null);

export function GeofencingProvider({ children }: { children: ReactNode }) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const { info, success, warning } = useNotifications();

  // Initialize geofencing service
  useEffect(() => {
    const initializeGeofencing = async () => {
      // Load existing geofence regions
      await geofenceService.loadGeofenceRegions();
      setRegions(geofenceService.getRegisteredRegions());

      // Check if already tracking
      setIsTracking(geofenceService.isCurrentlyTracking());
      setCurrentLocation(geofenceService.getCurrentLocation());
    };

    initializeGeofencing();

    // Listen for geofence entry events
    const handleGeofenceEntry = (event: CustomEvent) => {
      const { region, distance } = event.detail;
      info(
        `You're ${Math.round(distance)}m away from a reported issue`,
        `Nearby Issue: ${region.title}`
      );
    };

    window.addEventListener("geofence-entry", handleGeofenceEntry as EventListener);

    return () => {
      window.removeEventListener("geofence-entry", handleGeofenceEntry as EventListener);
    };
  }, [info]);

  // Update state when geofence service changes
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setCurrentLocation(geofenceService.getCurrentLocation());
      setIsTracking(geofenceService.isCurrentlyTracking());
      setRegions(geofenceService.getRegisteredRegions());
    }, 1000);

    return () => clearInterval(updateInterval);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await geofenceService.requestPermission();
      setPermissionGranted(granted);
      
      if (granted) {
        success("Location access granted!", "Permission Granted");
      } else {
        warning("Location access is needed for proximity notifications", "Permission Required");
      }
      
      return granted;
    } catch (error) {
      warning("Failed to request location permission", "Permission Error");
      return false;
    }
  };

  const startTracking = async (): Promise<boolean> => {
    try {
      info("Starting location tracking...");
      const started = await geofenceService.startTracking();
      
      if (started) {
        setIsTracking(true);
        success("Location tracking enabled! You'll get notified about nearby issues.", "Tracking Started");
        
        // Auto-enable push notifications if not already enabled
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              info("Push notifications enabled for proximity alerts", "Notifications Ready");
            }
          });
        }
      } else {
        warning("Failed to start location tracking. Please check your permissions.", "Tracking Failed");
      }
      
      return started;
    } catch (error) {
      warning("Failed to start location tracking", "Error");
      return false;
    }
  };

  const stopTracking = (): void => {
    geofenceService.stopTracking();
    setIsTracking(false);
    info("Location tracking stopped", "Tracking Disabled");
  };

  const addRegion = (region: GeofenceRegion): void => {
    geofenceService.addRegion(region);
    setRegions(geofenceService.getRegisteredRegions());
  };

  const removeRegion = (regionId: string): void => {
    geofenceService.removeRegion(regionId);
    setRegions(geofenceService.getRegisteredRegions());
  };

  const value = {
    isTracking,
    currentLocation,
    permissionGranted,
    startTracking,
    stopTracking,
    requestPermission,
    addRegion,
    removeRegion,
    regions,
  };

  return (
    <GeofencingContext.Provider value={value}>
      {children}
    </GeofencingContext.Provider>
  );
}

export function useGeofencing() {
  const context = useContext(GeofencingContext);
  if (!context) {
    throw new Error("useGeofencing must be used within GeofencingProvider");
  }
  return context;
}