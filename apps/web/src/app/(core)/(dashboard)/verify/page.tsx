"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VerificationFeed } from "@web/components/verification";
import { Button } from "@web/components/ui/button";
import { MapPin, Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuth } from "@web/components/auth-provider";

export default function VerifyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          setLocationError("Unable to get your location. Please enable location services and try again.");
          setLocationLoading(false);
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    // Auto-request location on mount
    getUserLocation();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Verification</h1>
          <p className="text-gray-600 mb-4">
            Help verify completed fixes in your community by signing in.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In to Verify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">Verify Fixes</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Location Status */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Location</span>
            </div>
            {!userLocation && (
              <Button 
                onClick={getUserLocation} 
                variant="outline" 
                size="sm"
                disabled={locationLoading}
              >
                {locationLoading ? "Getting Location..." : "Enable Location"}
              </Button>
            )}
          </div>
          
          {locationError ? (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {locationError}
            </div>
          ) : userLocation ? (
            <div className="text-sm text-green-600">
              ✓ Location enabled - Showing nearby fixes within 5km
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Location access needed to show nearby fixes
            </div>
          )}
        </div>

        {/* Verification Feed */}
        <VerificationFeed 
          userLocation={userLocation || undefined}
          maxDistance={5000} // 5km radius
        />
      </div>
    </div>
  );
}