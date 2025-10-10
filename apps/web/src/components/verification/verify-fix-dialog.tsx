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
    verificationType: "original_reporter" | "community_member";
    verificationStatus: "resolved" | "still_there" | "incomplete";
    verificationNotes?: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }) => Promise<void>;
}

export function VerifyFixDialog({ 
  experienceId,
  experienceTitle,
  fixerName,
  isOriginalReporter,
  experienceLocation,
  onVerify
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
    if (open && !currentLocation) {
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
  }, [open, currentLocation, experienceLocation]);

  const getDistanceColor = (distance: number) => {
    if (distance <= 100) return "text-green-600";
    if (distance <= 500) return "text-yellow-600";
    return "text-red-600";
  };

  const getDistanceMessage = (distance: number) => {
    if (distance <= 100) return "Perfect! You're at the location.";
    if (distance <= 500) return "You're close to the location.";
    return "You're quite far from the original location.";
  };

  const handleSubmit = async () => {
    if (!currentLocation) {
      setLocationError("Location is required for verification.");
      return;
    }

    setSubmitting(true);
    try {
      await onVerify({
        verificationType: isOriginalReporter ? "original_reporter" : "community_member",
        verificationStatus,
        verificationNotes: verificationNotes.trim() || undefined,
        location: currentLocation
      });
      
      setOpen(false);
      setVerificationStatus("resolved");
      setVerificationNotes("");
      setCurrentLocation(null);
      setDistance(null);
    } catch (error) {
      console.error("Failed to submit verification:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Button variant="outline" disabled>
        <Shield className="mr-2 h-4 w-4" />
        Sign in to Verify
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="border-green-600 text-green-700 hover:bg-green-50"
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-semibold">Verify Fix</span>
            {isOriginalReporter && (
              <Badge className="bg-blue-100 text-blue-800">
                <Star className="mr-1 h-3 w-3" />
                Original Reporter
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Verifying fix by <strong>{fixerName}</strong> for: <strong>{experienceTitle}</strong>
          </p>
        
          {/* Location Status */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-sm">Location Verification</span>
            </div>
            
            {locationError ? (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {locationError}
              </div>
            ) : currentLocation && distance !== null ? (
              <div className="space-y-1">
                <div className={`text-sm font-medium ${getDistanceColor(distance)}`}>
                  {Math.round(distance)}m from original location
                </div>
                <div className="text-xs text-gray-600">
                  {getDistanceMessage(distance)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Getting your location...</div>
            )}
          </div>

          {/* Verification Status */}
          <div>
            <Label className="text-base font-medium">What did you find?</Label>
            <RadioGroup 
              value={verificationStatus} 
              onValueChange={(value) => setVerificationStatus(value as any)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="resolved" id="resolved" />
                <Label htmlFor="resolved" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Fixed - Issue is completely resolved
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incomplete" id="incomplete" />
                <Label htmlFor="incomplete" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Partially Fixed - Some improvement but not complete
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="still_there" id="still_there" />
                <Label htmlFor="still_there" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Not Fixed - Issue is still there
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Verification Notes */}
          <div>
            <Label htmlFor="verification-notes">Additional Notes (Optional)</Label>
            <Textarea
              id="verification-notes"
              placeholder="Any additional details about the current state..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="min-h-[60px] mt-1"
            />
          </div>

          {/* Verification Impact */}
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Your verification helps:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Confirm the fix worked</li>
                  <li>• Give credit to the fixer</li>
                  <li>• Build community trust</li>
                  {isOriginalReporter && (
                    <li>• <strong>Your verification carries extra weight!</strong></li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!currentLocation || submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Submitting..." : "Submit Verification"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}