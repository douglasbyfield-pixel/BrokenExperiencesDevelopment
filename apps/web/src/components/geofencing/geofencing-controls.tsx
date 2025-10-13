"use client";

import { useGeofencing } from "./geofencing-provider";
import { Button } from "@web/components/ui/button";
import { Badge } from "@web/components/ui/badge";
import { MapPin, Bell, BellOff, Play, Square, Navigation } from "lucide-react";
import { useState } from "react";

export function GeofencingControls() {
  const {
    isTracking,
    currentLocation,
    permissionGranted,
    startTracking,
    stopTracking,
    requestPermission,
    regions,
  } = useGeofencing();

  const [isLoading, setIsLoading] = useState(false);

  const handleStartTracking = async () => {
    setIsLoading(true);
    
    if (!permissionGranted) {
      await requestPermission();
    }
    
    await startTracking();
    setIsLoading(false);
  };

  const handleStopTracking = () => {
    stopTracking();
  };

  const formatLocation = (location: { latitude: number; longitude: number }) => {
    return `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Navigation className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-lg">Proximity Notifications</h3>
      </div>

      <div className="space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {isTracking ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Bell className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <Badge variant="outline" className="text-gray-600">
                  <BellOff className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Current Location */}
        {currentLocation && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Location:</span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              {formatLocation(currentLocation)}
            </div>
          </div>
        )}

        {/* Monitoring Regions */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Monitoring:</span>
          <Badge variant="outline" className="text-blue-600">
            {regions.length} issue{regions.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Controls */}
        <div className="pt-2 border-t">
          {!isTracking ? (
            <Button
              onClick={handleStartTracking}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? "Starting..." : "Enable Proximity Alerts"}
            </Button>
          ) : (
            <Button
              onClick={handleStopTracking}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Square className="h-4 w-4 mr-2" />
              Disable Alerts
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Get notified when you're near reported issues</p>
          <p>• Works even when the app is closed</p>
          <p>• Location data stays on your device</p>
        </div>
      </div>
    </div>
  );
}