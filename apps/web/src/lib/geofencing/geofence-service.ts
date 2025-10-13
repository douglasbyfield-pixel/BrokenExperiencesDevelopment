"use client";

import { createClient } from "@web/lib/supabase/client";

interface GeofenceRegion {
  id: string;
  experienceId: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  title: string;
  description: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

class GeofenceService {
  private watchId: number | null = null;
  private registeredRegions: GeofenceRegion[] = [];
  private lastKnownLocation: UserLocation | null = null;
  private isTracking = false;
  private permissionGranted = false;

  // Distance calculation using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Request location permission
  async requestPermission(): Promise<boolean> {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      return false;
    }

    try {
      // Request permission by trying to get current position
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      this.permissionGranted = true;
      return true;
    } catch (error) {
      console.error("Location permission denied:", error);
      return false;
    }
  }

  // Start location tracking
  async startTracking(): Promise<boolean> {
    if (this.isTracking) {
      console.log("Already tracking location");
      return true;
    }

    if (!this.permissionGranted) {
      const permitted = await this.requestPermission();
      if (!permitted) return false;
    }

    return new Promise((resolve) => {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          this.handleLocationUpdate(location);
          if (!this.isTracking) {
            this.isTracking = true;
            resolve(true);
          }
        },
        (error) => {
          console.error("Location tracking error:", error);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 30000, // Use cached location for 30 seconds
        }
      );
    });
  }

  // Stop location tracking
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    console.log("Location tracking stopped");
  }

  // Handle location updates
  private handleLocationUpdate(location: UserLocation): void {
    this.lastKnownLocation = location;
    console.log("Location updated:", location);

    // Check all registered geofence regions
    this.checkGeofences(location);

    // Update location on server for server-side geofencing
    this.updateServerLocation(location);
  }

  // Check if user is within any geofence regions
  private checkGeofences(location: UserLocation): void {
    this.registeredRegions.forEach((region) => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        region.latitude,
        region.longitude
      );

      if (distance <= region.radius) {
        this.triggerGeofenceEntry(region, distance);
      }
    });
  }

  // Trigger geofence entry notification
  private async triggerGeofenceEntry(region: GeofenceRegion, distance: number): Promise<void> {
    // Check if we've already notified for this region recently
    const lastNotified = localStorage.getItem(`geofence_${region.id}_notified`);
    const now = Date.now();
    
    if (lastNotified && now - parseInt(lastNotified) < 3600000) { // 1 hour cooldown
      return;
    }

    console.log(`Geofence entry: ${region.title} (${Math.round(distance)}m away)`);

    // Store notification time
    localStorage.setItem(`geofence_${region.id}_notified`, now.toString());

    // Send push notification if supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      const registration = await navigator.serviceWorker.ready;
      
      // Post message to service worker to show notification
      registration.active?.postMessage({
        type: "SHOW_GEOFENCE_NOTIFICATION",
        data: {
          title: `Nearby Issue: ${region.title}`,
          body: `You're ${Math.round(distance)}m away from a reported issue`,
          icon: "/images/logo.png",
          badge: "/images/logo.png",
          tag: `geofence-${region.id}`,
          data: {
            experienceId: region.experienceId,
            regionId: region.id,
            distance: Math.round(distance),
            url: `/experience/${region.experienceId}`,
          },
          actions: [
            {
              action: "view",
              title: "👀 View Issue",
              icon: "/images/logo.png",
            },
            {
              action: "directions",
              title: "🗺️ Get Directions",
              icon: "/images/logo.png",
            },
          ],
        },
      });
    }

    // Also trigger in-app notification if available
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("geofence-entry", {
          detail: { region, distance },
        })
      );
    }
  }

  // Update server with current location for server-side geofencing
  private async updateServerLocation(location: UserLocation): Promise<void> {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return; // User not logged in
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      
      // Send location update to server
      await fetch(`${apiUrl}/user/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
        }),
      });
    } catch (error) {
      console.error("Failed to update server location:", error);
    }
  }

  // Load geofence regions from server
  async loadGeofenceRegions(): Promise<void> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      
      const response = await fetch(`${apiUrl}/geofence/regions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const regions: GeofenceRegion[] = await response.json();
        this.registeredRegions = regions;
        console.log(`Loaded ${regions.length} geofence regions`);
      }
    } catch (error) {
      console.error("Failed to load geofence regions:", error);
    }
  }

  // Add a geofence region
  addRegion(region: GeofenceRegion): void {
    const existingIndex = this.registeredRegions.findIndex(r => r.id === region.id);
    if (existingIndex >= 0) {
      this.registeredRegions[existingIndex] = region;
    } else {
      this.registeredRegions.push(region);
    }
    console.log(`Added geofence region: ${region.title}`);
  }

  // Remove a geofence region
  removeRegion(regionId: string): void {
    this.registeredRegions = this.registeredRegions.filter(r => r.id !== regionId);
    console.log(`Removed geofence region: ${regionId}`);
  }

  // Get current location
  getCurrentLocation(): UserLocation | null {
    return this.lastKnownLocation;
  }

  // Get tracking status
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Get registered regions
  getRegisteredRegions(): GeofenceRegion[] {
    return [...this.registeredRegions];
  }
}

// Export singleton instance
export const geofenceService = new GeofenceService();
export type { GeofenceRegion, UserLocation };