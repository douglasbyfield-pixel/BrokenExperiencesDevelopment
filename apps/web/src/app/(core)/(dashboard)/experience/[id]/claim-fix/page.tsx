"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useExperience } from "@web/hooks/use-experiences";
import { useUserFixes } from "@web/hooks/use-fixes";
import { useAuth } from "@web/components/auth-provider";
import { Button } from "@web/components/ui/button";
import { ArrowLeft, Wrench, MapPin, Camera, CheckCircle } from "lucide-react";
import { createClient } from "@web/lib/supabase/client";

export default function ClaimFixPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;
  
  const { user } = useAuth();
  const { data: experience, isLoading } = useExperience(experienceId);
  const { data: userFixes } = useUserFixes(user?.id);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Check if user has already claimed this issue
  const hasClaimedFix = userFixes?.some(fix => fix.experienceId === experienceId);
  const userFix = userFixes?.find(fix => fix.experienceId === experienceId);

  const handleClaim = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (hasClaimedFix) {
      // If already claimed, navigate to My Fixes instead
      router.push("/my-fixes");
      return;
    }

    setClaiming(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
      
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
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Fix claimed successfully:", result);
      setClaimed(true);
    } catch (error) {
      console.error("Failed to claim fix:", error);
      alert(error instanceof Error ? error.message : "Failed to claim fix. Please try again.");
      setClaiming(false);
    }
  };

  const handleUploadBeforePhoto = () => {
    // TODO: Navigate to camera/photo upload
    router.push(`/camera?for=before-photo&fixId=${experienceId}`);
  };

  const handleViewMyFixes = () => {
    router.push("/my-fixes");
  };

  const handleStartWork = async () => {
    if (!userFix) return;
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
      
      const response = await fetch(`${apiUrl}/experience/fixes/${userFix.id}/status`, {
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
        throw new Error(`Failed to start work: ${response.statusText}`);
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Failed to start work:", error);
      alert("Failed to start work. Please try again.");
    }
  };

  const handleUploadProof = async (imageUrls: string[], notes?: string) => {
    if (!userFix) return;
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
      
      const response = await fetch(`${apiUrl}/experience/fixes/${userFix.id}/proof`, {
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
        throw new Error(`Failed to upload proof: ${response.statusText}`);
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Failed to upload proof:", error);
      alert("Failed to upload proof. Please try again.");
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

  // Simple mock data for demo
  const mockFixers = [
    { name: "John D.", status: "In Progress" },
    { name: "Sarah M.", status: "Claimed" }
  ];

  // Show different UI based on fix status
  if (claimed || (hasClaimedFix && userFix)) {
    const fixStatus = userFix?.status || "claimed";
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
            <div className="text-left bg-blue-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-900 text-sm mb-2">Working on it:</p>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>✓ Issue claimed</li>
                <li>✓ Work started</li>
                <li>• Upload proof when done</li>
              </ol>
            </div>
          )}

          {fixStatus === "completed" && (
            <div className="text-left bg-green-50 rounded-lg p-4 mb-6">
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
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Start Working
              </Button>
            )}

            {fixStatus === "in_progress" && (
              <Button 
                onClick={() => handleUploadProof(["placeholder-image.jpg"], "Fix completed")}
                className="w-full bg-green-600 text-white hover:bg-green-700"
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
            
            <Button 
              variant="outline"
              onClick={handleViewMyFixes}
              className="w-full"
            >
              View My Fixes
            </Button>
          </div>
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
          <h1 className="font-semibold text-gray-900">Issue Details</h1>
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
            disabled={claiming || !user || hasClaimedFix}
            className={`w-full h-12 text-lg font-medium transition-all ${
              hasClaimedFix 
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
            ) : hasClaimedFix ? (
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
        {mockFixers.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="font-medium text-gray-900 text-sm mb-3">
              Already fixing: {mockFixers.length} people
            </p>
            <div className="space-y-2">
              {mockFixers.map((fixer, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {fixer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{fixer.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({fixer.status})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}