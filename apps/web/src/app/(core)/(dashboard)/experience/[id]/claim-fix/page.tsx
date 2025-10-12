"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useExperience } from "@web/hooks/use-experiences";
import { useUserFixes } from "@web/hooks/use-fixes";
import { useAuth } from "@web/components/auth-provider";
import { Button } from "@web/components/ui/button";
import { ArrowLeft, Wrench, MapPin, Camera, CheckCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@web/lib/supabase/client";
import { UploadProofDialog } from "@web/components/fix/upload-proof-dialog";
import { uploadMultipleImages } from "@web/lib/supabase/storage";

export default function ClaimFixPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;
  
  const { user } = useAuth();
  const { data: experience, isLoading } = useExperience(experienceId);
  const { data: userFixes } = useUserFixes(user?.id);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [experienceFixes, setExperienceFixes] = useState<any[]>([]);
  const [showProofDialog, setShowProofDialog] = useState(false);

  // Fetch experience fixes
  useEffect(() => {
    const fetchExperienceFixes = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/experience/${experienceId}/fixes`);
        
        if (response.ok) {
          const fixes = await response.json();
          setExperienceFixes(fixes);
        }
      } catch (error) {
        console.error("Failed to fetch experience fixes:", error);
      }
    };

    if (experienceId) {
      fetchExperienceFixes();
    }
  }, [experienceId]);

  // Check if user has already claimed this issue
  const hasClaimedFix = userFixes?.some(fix => fix.experienceId === experienceId);
  const userFix = userFixes?.find(fix => fix.experienceId === experienceId);

  const handleClaim = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (userHasAlreadyClaimed) {
      // If already claimed, navigate to My Fixes instead
      router.push("/my-fixes");
      return;
    }

    if (claiming) {
      // Prevent multiple concurrent claims
      return;
    }

    // Double-check by fetching latest fixes before claiming
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const checkResponse = await fetch(`${apiUrl}/experience/${experienceId}/fixes`);
      if (checkResponse.ok) {
        const latestFixes = await checkResponse.json();
        const userAlreadyClaimed = latestFixes.some((fix: any) => fix.claimedBy?.id === user.id);
        if (userAlreadyClaimed) {
          // User has already claimed, refresh the UI state
          setExperienceFixes(latestFixes);
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to check latest fixes before claiming:", error);
    }

    setClaiming(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      
      const response = await fetch(`${apiUrl}/experience/${experienceId}/claim-fix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to claim fix" }));
        
        // Handle specific duplicate claim error
        if (response.status === 400 || errorData.message?.includes("already claimed")) {
          // Refresh the page to sync the UI state
          window.location.reload();
          return;
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Fix claimed successfully:", result);
      setClaimed(true);
      
      // Refresh the fixes list to show the new claim
      const fixesResponse = await fetch(`${apiUrl}/experience/${experienceId}/fixes`);
      if (fixesResponse.ok) {
        const fixes = await fixesResponse.json();
        setExperienceFixes(fixes);
      }
    } catch (error) {
      console.error("Failed to claim fix:", error);
      
      // Don't show raw database errors to user
      const errorMessage = error instanceof Error ? error.message : "Failed to claim fix. Please try again.";
      if (errorMessage.includes("Failed query") || errorMessage.includes("duplicate key")) {
        // This is likely a duplicate claim, just refresh the page
        window.location.reload();
        return;
      }
      
      alert(errorMessage);
      setClaiming(false);
    }
  };

  const handleUploadBeforePhoto = () => {
    router.push(`/camera?for=before-photo&fixId=${experienceId}&experienceId=${experienceId}`);
  };

  const handleViewMyFixes = () => {
    router.push("/my-fixes");
  };

  const handleStartWork = async () => {
    // Get the fix ID from either userFixes or experienceFixes
    const currentUserFix = userFix || uniqueFixes.find(fix => fix.claimedBy?.id === user?.id);
    
    if (!currentUserFix) {
      console.error("No fix found for current user");
      alert("Could not find your fix. Please try refreshing the page.");
      return;
    }
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      
      const response = await fetch(`${apiUrl}/experience/fixes/${currentUserFix.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          status: "in_progress"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Start work API error:", response.status, errorData);
        throw new Error(`Failed to start work: ${errorData.message || response.statusText}`);
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Failed to start work:", error);
      alert("Failed to start work. Please try again.");
    }
  };

  const handleUploadProof = async (images: File[], notes: string) => {
    // Get the fix ID from either userFixes or experienceFixes
    const currentUserFix = userFix || uniqueFixes.find(fix => fix.claimedBy?.id === user?.id);
    if (!currentUserFix) {
      throw new Error("No fix found for current user");
    }
    
    try {
      // First upload images to Supabase Storage
      console.log("Uploading images...", images.length);
      const imageUrls = await uploadMultipleImages(images);
      console.log("Images uploaded:", imageUrls);

      // Then submit proof to backend
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      
      const response = await fetch(`${apiUrl}/experience/fixes/${currentUserFix.id}/proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          imageUrls,
          notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(`Failed to upload proof: ${errorData.message || response.statusText}`);
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Failed to upload proof:", error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const formatRelativeTime = (dateString: string | Date) => {
    const now = new Date();
    const postDate = typeof dateString === "string" ? new Date(dateString) : dateString;
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    const isSameDay = now.toDateString() === postDate.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = postDate.toDateString() === yesterday.toDateString();

    if (isSameDay) {
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      return `${diffInHours}h ago`;
    }
    if (isYesterday) return "Yesterday";
    return postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-start gap-3 p-4">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Experience not found</p>
      </div>
    );
  }

  const displayName = experience.reportedBy?.name || 
    experience.reportedBy?.email?.split("@")[0] || 
    "Anonymous";

  const realImages = experience.experienceImages?.filter(
    (img: any) =>
      img.imageUrl &&
      img.imageUrl.trim() !== "" &&
      !img.imageUrl.includes("placeholder") &&
      img.imageUrl.startsWith("http")
  ) || [];

  // Format the real fixes data for display
  const formatFixStatus = (status: string) => {
    switch (status) {
      case 'claimed': return 'Claimed';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'verified': return 'Verified';
      case 'abandoned': return 'Abandoned';
      default: return 'Unknown';
    }
  };

  const formatFixerName = (claimedBy: any) => {
    if (!claimedBy) return 'Anonymous';
    if (claimedBy.name) return claimedBy.name;
    if (claimedBy.email) return claimedBy.email.split('@')[0];
    return 'Anonymous';
  };

  // Deduplicate fixes by user ID to prevent showing the same person multiple times
  const uniqueFixes = experienceFixes.filter((fix, index, array) => {
    return index === array.findIndex(f => f.claimedBy?.id === fix.claimedBy?.id);
  });

  // Also check if current user has already claimed this fix from the experience fixes data
  const hasClaimedFromFixes = uniqueFixes.some(fix => fix.claimedBy?.id === user?.id);
  
  // Combined check - user has claimed if EITHER condition is true
  const userHasAlreadyClaimed = hasClaimedFix || hasClaimedFromFixes;

  // Show different UI based on fix status
  if (claimed || (hasClaimedFix && userFix) || hasClaimedFromFixes) {
    // Get the current user's fix from either data source
    const currentUserFix = userFix || uniqueFixes.find(fix => fix.claimedBy?.id === user?.id);
    const fixStatus = currentUserFix?.status || "claimed";
    
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
            <h1 className="font-semibold text-gray-900">Fix Status</h1>
          </div>
        </div>

        <div className="flex items-center justify-center pt-8">
          <div className="max-w-sm mx-auto text-center px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {fixStatus === "claimed" && "Claimed!"}
            {fixStatus === "in_progress" && "In Progress"}
            {fixStatus === "completed" && "Completed!"}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {fixStatus === "claimed" && "This issue is now on your \"My Fixes\" list"}
            {fixStatus === "in_progress" && "You're working on this issue"}
            {fixStatus === "completed" && "Fix completed! Awaiting community verification"}
          </p>
          
          {fixStatus === "claimed" && (
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-900 text-sm mb-2">Next steps:</p>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Start working on the issue</li>
                <li>2. Upload proof when completed</li>
                <li>3. Get community verification</li>
              </ol>
            </div>
          )}

          {fixStatus === "in_progress" && (
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-900 text-sm mb-2">Working on it:</p>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>✓ Issue claimed</li>
                <li>✓ Work started</li>
                <li>• Upload proof when done</li>
              </ol>
            </div>
          )}

          {fixStatus === "completed" && (
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-900 text-sm mb-2">Fix completed:</p>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>✓ Issue claimed</li>
                <li>✓ Work completed</li>
                <li>✓ Proof uploaded</li>
                <li>• Awaiting verification</li>
              </ol>
            </div>
          )}
          
          <div className="space-y-3">
            {fixStatus === "claimed" && (
              <Button 
                onClick={handleStartWork}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Start Working
              </Button>
            )}

            {fixStatus === "in_progress" && (
              <Button 
                onClick={() => setShowProofDialog(true)}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Proof & Complete
              </Button>
            )}

            {fixStatus === "completed" && (
              <Button 
                variant="outline"
                onClick={() => alert("Waiting for community verification")}
                className="w-full"
                disabled
              >
                Awaiting Verification
              </Button>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handleViewMyFixes}
                className="flex-1"
              >
                View My Fixes
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/verify")}
                className="border-black text-black hover:bg-black hover:text-white transition-colors"
                title="Verify Other Fixes"
              >
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </div>
          </div>
          </div>
        </div>

        {/* Upload Proof Dialog */}
        <UploadProofDialog
          isOpen={showProofDialog}
          onClose={() => setShowProofDialog(false)}
          onSubmit={handleUploadProof}
          issueTitle={experience?.title || "Issue"}
          fixId={currentUserFix?.id}
          experienceId={experienceId}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">Issue Details</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/verify")}
            className="p-1 hover:bg-gray-100"
            title="Verify Fixes"
          >
            <ShieldCheck className="h-5 w-5 text-black" />
          </Button>
        </div>
      </div>

      {/* Issue Photo */}
      {realImages.length > 0 && (
        <div className="px-4">
          <div className="w-full overflow-hidden rounded-lg bg-gray-50">
            <img
              src={realImages[0].imageUrl}
              alt="Issue"
              className="h-64 w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Issue Info */}
      <div className="px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {experience.title || "Issue Report"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span>Posted by {displayName}</span>
            <span>•</span>
            <span>{formatRelativeTime(experience.createdAt)}</span>
          </div>
          
          {/* Cosigns */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">{experience.upvotes || 0}</span>
              <span className="text-gray-600 text-sm">cosigns</span>
            </div>
          </div>

          {/* Location */}
          {experience.address && (
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">0.3 miles away</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-gray-900 leading-relaxed">
            {experience.description}
          </p>
        </div>

        {/* Big Fix Button */}
        <div className="py-4">
          <Button
            onClick={handleClaim}
            disabled={claiming || !user || userHasAlreadyClaimed}
            className={`w-full h-12 text-lg font-medium transition-all ${
              userHasAlreadyClaimed
                ? "bg-gray-400 text-gray-600 cursor-default hover:bg-gray-400" 
                : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            }`}
          >
            {claiming ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Claiming...
              </div>
            ) : !user ? (
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Sign in to Fix
              </div>
            ) : userHasAlreadyClaimed ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Already Claimed - View My Fixes
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                I'll Fix This
              </div>
            )}
          </Button>
        </div>

        {/* Already Fixing */}
        {uniqueFixes.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="font-medium text-gray-900 text-sm mb-3">
              Already fixing: {uniqueFixes.length} people
            </p>
            <div className="space-y-2">
              {uniqueFixes.map((fix, index) => {
                const fixerName = formatFixerName(fix.claimedBy);
                const fixStatus = formatFixStatus(fix.status);
                const initials = fixerName.charAt(0).toUpperCase();
                
                return (
                  <div key={fix.id || index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{fixerName}</span>
                      <span className="text-sm text-gray-600 ml-2">({fixStatus})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upload Proof Dialog */}
      <UploadProofDialog
        isOpen={showProofDialog}
        onClose={() => setShowProofDialog(false)}
        onSubmit={handleUploadProof}
        issueTitle={experience?.title || "Issue"}
        fixId={uniqueFixes.find(fix => fix.claimedBy?.id === user?.id)?.id}
        experienceId={experienceId}
      />
    </div>
  );
}