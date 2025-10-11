"use client";

import { useState, useEffect } from "react";
import { Button } from "@web/components/ui/button";
import { Badge } from "@web/components/ui/badge";
import { VerifyFixDialog } from "./verify-fix-dialog";
import { 
  MapPin, 
  Clock, 
  User, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Camera
} from "lucide-react";
import { useAuth } from "@web/components/auth-provider";

interface CompletedFix {
  id: string;
  experienceId: string;
  experienceTitle: string;
  experienceDescription: string;
  fixerName: string;
  fixerId: string;
  completedAt: string;
  proofImages: string[];
  fixNotes?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  distance: number; // Distance from user in meters
  isOriginalReporter: boolean;
  verificationCount: number;
  requiredVerifications: number;
}

interface VerificationFeedProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  maxDistance?: number; // Maximum distance in meters
}

export function VerificationFeed({ userLocation, maxDistance = 5000 }: VerificationFeedProps) {
  const { user } = useAuth();
  const [completedFixes, setCompletedFixes] = useState<CompletedFix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingFixId, setVerifyingFixId] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyCompletedFixes();
    }
  }, [userLocation]);

  const fetchNearbyCompletedFixes = async () => {
    if (!userLocation) return;
    
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const response = await fetch(
        `${apiUrl}/experience/fixes/completed-nearby?` + 
        `lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=${maxDistance}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch nearby completed fixes");
      }

      const fixes = await response.json();
      setCompletedFixes(fixes);
    } catch (error) {
      console.error("Failed to fetch completed fixes:", error);
      setError("Failed to load nearby fixes for verification");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (experienceId: string, verificationData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/experience/${experienceId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Refresh the feed
      await fetchNearbyCompletedFixes();
    } catch (error) {
      console.error("Failed to submit verification:", error);
      throw error;
    }
  };

  const getAuthToken = async () => {
    // This should match your auth implementation
    const { createClient } = await import("@web/lib/supabase/client");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const completed = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - completed.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just completed";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getVerificationProgress = (current: number, required: number) => {
    const percentage = (current / required) * 100;
    return Math.min(percentage, 100);
  };

  if (!user) {
    return (
      <div className="text-center p-6">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Sign in to help verify completed fixes in your area</p>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="text-center p-6">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Enable location to see nearby fixes that need verification</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse border rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 mb-3">{error}</p>
        <Button onClick={fetchNearbyCompletedFixes} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (completedFixes.length === 0) {
    return (
      <div className="text-center p-6">
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
        <p className="text-gray-600">No completed fixes need verification in your area</p>
        <p className="text-sm text-gray-500 mt-1">Check back later or expand your search radius</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Nearby Fixes to Verify</h2>
        <Badge variant="outline">{completedFixes.length} available</Badge>
      </div>

      {completedFixes.map((fix) => (
        <div key={fix.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex gap-4">
            {/* Proof Images */}
            <div className="flex-shrink-0">
              {fix.proofImages.length > 0 ? (
                <div className="relative group cursor-pointer">
                  <img
                    src={fix.proofImages[0]}
                    alt="Fix proof"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-black transition-all"
                    onClick={() => window.open(fix.proofImages[0], '_blank')}
                  />
                  {fix.proofImages.length > 1 && (
                    <Badge className="absolute -top-1 -right-1 text-xs bg-black text-white">
                      +{fix.proofImages.length - 1}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Fix Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate">{fix.experienceTitle}</h3>
                {fix.isOriginalReporter && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                    Your Report
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {fix.experienceDescription}
              </p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Fixed by {fix.fixerName}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(fix.completedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(fix.distance)}
                </div>
              </div>

              {/* Verification Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Verification Progress</span>
                  <span>{fix.verificationCount}/{fix.requiredVerifications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${getVerificationProgress(fix.verificationCount, fix.requiredVerifications)}%` }}
                  />
                </div>
              </div>

              {/* Fix Notes */}
              {fix.fixNotes && (
                <div className="mb-3 p-3 bg-gray-50 rounded border-l-4 border-black">
                  <div className="text-xs font-medium text-gray-600 mb-1">Fixer Notes</div>
                  <p className="text-sm text-black">
                    "{fix.fixNotes}"
                  </p>
                </div>
              )}

              {/* Proof Images Section */}
              {fix.proofImages.length > 0 && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">
                      Proof Images ({fix.proofImages.length})
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {fix.proofImages.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Proof ${index + 1}`}
                        className="w-12 h-12 object-cover rounded cursor-pointer border hover:border-black transition-colors"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                    {fix.proofImages.length > 4 && (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                        +{fix.proofImages.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Actions */}
              <div className="flex gap-2">
                {fix.proofImages.length === 0 ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Camera className="h-4 w-4" />
                    <span>No proof images - cannot verify</span>
                  </div>
                ) : fix.distance <= 200 ? (
                  verifyingFixId === fix.experienceId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVerifyingFixId(null)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Cancel Verification
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVerifyingFixId(fix.experienceId)}
                      className="border-black text-black hover:bg-black hover:text-white transition-colors font-medium"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Fix
                    </Button>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Too far to verify ({Math.round(fix.distance)}m away)</span>
                  </div>
                )}
                {fix.proofImages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open all images in new tabs
                      fix.proofImages.forEach((image, index) => {
                        setTimeout(() => window.open(image, '_blank'), index * 100);
                      });
                    }}
                    className="text-gray-600 hover:text-black border-gray-300 hover:border-black"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    View All Proof
                  </Button>
                )}
              </div>

              {/* Inline Verification Form */}
              {verifyingFixId === fix.experienceId && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <VerifyFixDialog
                    experienceId={fix.experienceId}
                    experienceTitle={fix.experienceTitle}
                    fixerName={fix.fixerName}
                    isOriginalReporter={fix.isOriginalReporter}
                    experienceLocation={fix.location}
                    onVerify={async (data) => {
                      await handleVerification(fix.experienceId, data);
                      setVerifyingFixId(null);
                    }}
                    isInline={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

    </div>
  );
}