"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CameraCapture } from "@web/components/ui/camera-capture";
import { Button } from "@web/components/ui/button";
import { ArrowLeft, X, Upload, Camera } from "lucide-react";
import { uploadMultipleImages } from "@web/lib/supabase/storage";
import { createClient } from "@web/lib/supabase/client";

export default function CameraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const purpose = searchParams.get("for"); // e.g., "before-photo", "proof", "issue-report"
  const fixId = searchParams.get("fixId");
  const experienceId = searchParams.get("experienceId");
  
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Page title based on purpose
  const getTitle = () => {
    switch (purpose) {
      case "before-photo":
        return "Take Before Photo";
      case "proof":
        return "Upload Proof";
      case "issue-report":
        return "Report Issue";
      default:
        return "Take Photo";
    }
  };

  const getDescription = () => {
    switch (purpose) {
      case "before-photo":
        return "Take a photo showing the issue before you start working on it";
      case "proof":
        return "Take photos showing your completed work";
      case "issue-report":
        return "Take photos of the issue you want to report";
      default:
        return "Take photos";
    }
  };

  const handleCameraCapture = (file: File) => {
    setCapturedImages(prev => [...prev, file]);
  };

  const handleRemoveImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (capturedImages.length === 0) {
      alert("Please take at least one photo");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images to Supabase Storage
      console.log("Uploading images...", capturedImages.length);
      const imageUrls = await uploadMultipleImages(capturedImages);
      console.log("Images uploaded:", imageUrls);

      if (purpose === "proof" && fixId) {
        // Submit proof to backend
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error("No authentication token found");
        }

        const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        
        const response = await fetch(`${apiUrl}/experience/fixes/${fixId}/proof`, {
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

        // Navigate back to the fix page
        router.push(`/experience/${experienceId}/claim-fix`);
      } else {
        // For other purposes, just go back with the image URLs
        // Could extend this to pass back the images via state or URL params
        router.back();
      }
    } catch (error) {
      console.error("Failed to submit photos:", error);
      alert(error instanceof Error ? error.message : "Failed to submit photos. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {showCamera ? (
        <CameraCapture
          isOpen={showCamera}
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      ) : (
        <>
          {/* Header */}
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-1 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold text-gray-900">{getTitle()}</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {getDescription()}
              </p>
            </div>

            {/* Photos Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">
                Photos ({capturedImages.length})
              </label>

              {/* Photo Grid */}
              {capturedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {capturedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 text-xs hover:bg-gray-800 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Camera Button */}
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                className="w-full border-black text-black hover:bg-black hover:text-white transition-colors h-12"
                disabled={isSubmitting}
              >
                <Camera className="h-5 w-5 mr-2" />
                {capturedImages.length === 0 ? "Take Photo" : "Take Another Photo"}
              </Button>
            </div>

            {/* Notes Section (for proof submissions) */}
            {purpose === "proof" && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what you did to fix this issue..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Submit Button */}
            {capturedImages.length > 0 && (
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-colors h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {purpose === "proof" ? "Submitting Proof..." : "Uploading..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      {purpose === "proof" ? "Submit Proof" : "Upload Photos"}
                    </div>
                  )}
                </Button>

                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="w-full border-gray-300 text-black hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}