"use client";

import { useState, useEffect } from "react";
import { Button } from "@web/components/ui/button";
import { Dialog } from "@web/components/ui/dialog";
import { Textarea } from "@web/components/ui/textarea";
import { Label } from "@web/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@web/components/ui/radio-group";
import { Badge } from "@web/components/ui/badge";
import { 
  CheckCircle, 
  MapPin, 
  Camera, 
  Shield, 
  AlertTriangle,
  User,
  Star
} from "lucide-react";
import { useAuth } from "@web/components/auth-provider";

interface VerifyFixDialogProps {
  experienceId: string;
  experienceTitle: string;
  fixerName: string;
  isOriginalReporter: boolean;
  experienceLocation: {
    latitude: number;
    longitude: number;
  };
  onVerify: (data: {
    verified: boolean;
    notes?: string;
    verificationType: "original_reporter" | "community_member";
    verificationStatus: "resolved" | "still_there" | "incomplete";
    location: {
      latitude: number;
      longitude: number;
    };
  }) => Promise<void>;
  isInline?: boolean;
}

export function VerifyFixDialog({ 
  experienceId,
  experienceTitle,
  fixerName,
  isOriginalReporter,
  experienceLocation,
  onVerify,
  isInline = false
}: VerifyFixDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"resolved" | "still_there" | "incomplete">("resolved");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  // Get current location
  useEffect(() => {
    if ((open || isInline) && !currentLocation) {
      setLocationError(null);
      
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setCurrentLocation(newLocation);
            
            // Calculate distance from original issue
            const dist = calculateDistance(
              experienceLocation.latitude,
              experienceLocation.longitude,
              newLocation.latitude,
              newLocation.longitude
            );
            setDistance(dist);
          },
          (error) => {
            setLocationError("Unable to get your location. Please enable location services.");
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser.");
      }
    }
  }, [open, isInline, currentLocation, experienceLocation]);

  const MAX_VERIFICATION_DISTANCE = 200; // 200 meters

  const isWithinVerificationRange = (distance: number) => {
    return distance <= MAX_VERIFICATION_DISTANCE;
  };

  const getDistanceStatus = (distance: number) => {
    if (distance <= 50) return { color: "text-green-600", message: "At location" };
    if (distance <= MAX_VERIFICATION_DISTANCE) return { color: "text-black", message: "Close enough to verify" };
    return { color: "text-red-600", message: "Too far to verify" };
  };

  const handleSubmit = async () => {
    if (!currentLocation) {
      setLocationError("Location is required for verification.");
      return;
    }

    if (distance !== null && !isWithinVerificationRange(distance)) {
      setLocationError("You must be within 200m of the issue to verify.");
      return;
    }

    setSubmitting(true);
    try {
      await onVerify({
        verified: verificationStatus === "resolved",
        notes: verificationNotes.trim() || undefined,
        verificationType: isOriginalReporter ? "original_reporter" : "community_member",
        verificationStatus,
        location: currentLocation
      });
      
      setOpen(false);
      setVerificationStatus("resolved");
      setVerificationNotes("");
      setCurrentLocation(null);
      setDistance(null);
    } catch (error) {
      console.error("Failed to submit verification:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit verification";
      setLocationError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return isInline ? (
      <div className="text-center text-gray-600 p-4">
        Sign in to verify fixes
      </div>
    ) : (
      <Button variant="outline" disabled>
        <Shield className="mr-2 h-4 w-4" />
        Sign in to Verify
      </Button>
    );
  }

  // Inline form content
  const formContent = (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          <span className="font-medium text-black">Verify Fix</span>
          {isOriginalReporter && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              Reporter
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Fix by {fixerName} for: {experienceTitle}
        </p>
      </div>
    
      {/* Location */}
      <div className="border border-gray-200 rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-black" />
          <span className="text-sm font-medium text-black">Location</span>
        </div>
        
        {locationError ? (
          <div className="text-sm text-red-600">
            {locationError}
          </div>
        ) : currentLocation && distance !== null ? (
          <div className="space-y-1">
            <div className={`text-sm font-medium ${getDistanceStatus(distance).color}`}>
              {Math.round(distance)}m from original location
            </div>
            <div className="text-xs text-gray-600">
              {getDistanceStatus(distance).message}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Getting location...</div>
        )}
      </div>

      {/* Status */}
      <div>
        <Label className="text-sm font-medium text-black mb-3 block">Status</Label>
        <RadioGroup 
          value={verificationStatus} 
          onValueChange={(value) => setVerificationStatus(value as any)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="resolved" id="resolved" />
            <Label htmlFor="resolved" className="text-sm text-black">
              Fixed
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="incomplete" id="incomplete" />
            <Label htmlFor="incomplete" className="text-sm text-black">
              Partially Fixed
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="still_there" id="still_there" />
            <Label htmlFor="still_there" className="text-sm text-black">
              Not Fixed
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="verification-notes" className="text-sm font-medium text-black mb-2 block">
          Notes (Optional)
        </Label>
        <Textarea
          id="verification-notes"
          placeholder="Additional details..."
          value={verificationNotes}
          onChange={(e) => setVerificationNotes(e.target.value)}
          className="min-h-[60px] border-gray-200 focus:border-black focus:ring-black"
        />
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={() => {
            if (isInline) {
              // For inline mode, we don't have setOpen, so just reset form
              setVerificationStatus("resolved");
              setVerificationNotes("");
              setCurrentLocation(null);
              setDistance(null);
            } else {
              setOpen(false);
            }
          }}
          className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={
            !currentLocation || 
            submitting || 
            (distance !== null && !isWithinVerificationRange(distance))
          }
          className="flex-1 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : 
           (distance !== null && !isWithinVerificationRange(distance)) ? "Too Far to Verify" : 
           "Submit"}
        </Button>
      </div>
    </div>
  );

  // Return inline version if requested
  if (isInline) {
    return formContent;
  }

  // Return modal version by default
  return (
    <>
      <Button 
        variant="outline" 
        className="border-black text-black hover:bg-black hover:text-white transition-colors font-medium"
        onClick={() => setOpen(true)}
      >
        <Shield className="mr-2 h-4 w-4" />
        Verify Fix
      </Button>

      <Dialog 
        open={open} 
        onOpenChange={setOpen}
        title="Verify Fix"
      >
        {formContent}
      </Dialog>
    </>
  );
}