"use client";

import { useState } from "react";
import { Button } from "@web/components/ui/button";
import { Dialog } from "@web/components/ui/dialog";
import { Textarea } from "@web/components/ui/textarea";
import { Label } from "@web/components/ui/label";
import { Wrench, Camera, MapPin } from "lucide-react";
import { useAuth } from "@web/components/auth-provider";

interface ClaimFixDialogProps {
  experienceId: string;
  experienceTitle: string;
  onClaim: (data: { claimNotes: string; beforeImages: File[] }) => Promise<void>;
  isLoading?: boolean;
}

export function ClaimFixDialog({ 
  experienceId, 
  experienceTitle, 
  onClaim, 
  isLoading = false 
}: ClaimFixDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [claimNotes, setClaimNotes] = useState("");
  const [beforeImages, setBeforeImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBeforeImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!claimNotes.trim()) return;
    
    setSubmitting(true);
    try {
      await onClaim({ claimNotes, beforeImages });
      setOpen(false);
      setClaimNotes("");
      setBeforeImages([]);
    } catch (error) {
      console.error("Failed to claim fix:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Button variant="outline" disabled>
        <Wrench className="mr-2 h-4 w-4" />
        Sign in to Fix
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="default" 
        className="bg-green-600 hover:bg-green-700"
        onClick={() => setOpen(true)}
      >
        <Wrench className="mr-2 h-4 w-4" />
        Claim to Fix
      </Button>

      <Dialog 
        open={open} 
        onOpenChange={setOpen}
        title="Claim Fix"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You're claiming to fix: <strong>{experienceTitle}</strong>
          </p>
          
          <div>
            <Label htmlFor="claim-notes">Fix Plan</Label>
            <Textarea
              id="claim-notes"
              placeholder="Describe how you plan to fix this issue..."
              value={claimNotes}
              onChange={(e) => setClaimNotes(e.target.value)}
              className="min-h-[80px] mt-1"
            />
          </div>

          <div>
            <Label htmlFor="before-images" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Before Photos (Required)
            </Label>
            <input
              id="before-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md mt-1"
            />
            {beforeImages.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {beforeImages.length} image(s) selected
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Before you start:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Take "before" photos of the current state</li>
                  <li>• Document your fix plan</li>
                  <li>• Upload progress photos as you work</li>
                  <li>• Submit "after" photos when complete</li>
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
              disabled={!claimNotes.trim() || beforeImages.length === 0 || submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Claiming..." : "Claim Fix"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}