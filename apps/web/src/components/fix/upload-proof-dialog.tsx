"use client";

import { useState } from "react";
import { Button } from "@web/components/ui/button";
import { CameraCapture } from "@web/components/ui/camera-capture";
import { X, Camera, Upload, Check } from "lucide-react";

interface UploadProofDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (images: File[], notes: string) => Promise<void>;
  issueTitle: string;
}

export function UploadProofDialog({ isOpen, onClose, onSubmit, issueTitle }: UploadProofDialogProps) {
  const [capturedImages, setCapturedImages] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCameraCapture = (file: File) => {
    setCapturedImages(prev => [...prev, file]);
  };

  const handleRemoveImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (capturedImages.length === 0) {
      alert("Please take at least one photo as proof");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(capturedImages, notes);
      // Reset form
      setCapturedImages([]);
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Failed to submit proof:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCapturedImages([]);
      setNotes("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Camera Component */}
      <CameraCapture
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />

      {/* Upload Dialog */}
      {!showCamera && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">Upload Proof</h3>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-black" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Upload photos showing you've completed work on:
                </p>
                <p className="font-medium text-black">{issueTitle}</p>
              </div>

              {/* Photos Section */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Photos ({capturedImages.length})
                </label>

                {/* Photo Grid */}
                {capturedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {capturedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Proof ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-1 -right-1 bg-black text-white rounded-full p-1 text-xs hover:bg-gray-800 transition-colors"
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
                  className="w-full border-black text-black hover:bg-black hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {capturedImages.length === 0 ? "Take Photo" : "Add Another Photo"}
                </Button>
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what you did to fix this issue..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-200">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-gray-300 text-black hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-black text-white hover:bg-gray-800 transition-colors"
                disabled={isSubmitting || capturedImages.length === 0}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Submit Proof
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}