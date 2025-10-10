"use client";

import { useState } from "react";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@web/components/ui/card";
import { Textarea } from "@web/components/ui/textarea";
import { Label } from "@web/components/ui/label";
import { Badge } from "@web/components/ui/badge";
import { Progress } from "@web/components/ui/progress";
import { 
  Camera, 
  Clock, 
  CheckCircle, 
  User, 
  Calendar,
  Upload,
  MessageSquare,
  Image as ImageIcon
} from "lucide-react";

interface FixData {
  id: string;
  experienceId: string;
  claimedBy: string;
  status: "claimed" | "in_progress" | "completed" | "abandoned";
  claimedAt: string;
  startedAt?: string;
  completedAt?: string;
  claimNotes?: string;
  fixNotes?: string;
  claimerName?: string;
  progressImages?: Array<{
    id: string;
    url: string;
    uploadedAt: string;
    notes?: string;
  }>;
}

interface FixProgressTrackerProps {
  fixData: FixData;
  experienceTitle: string;
  isOwner: boolean;
  onProgressUpdate: (data: { notes: string; images: File[] }) => Promise<void>;
  onComplete: (data: { notes: string; images: File[] }) => Promise<void>;
}

export function FixProgressTracker({ 
  fixData, 
  experienceTitle,
  isOwner,
  onProgressUpdate,
  onComplete 
}: FixProgressTrackerProps) {
  const [progressNotes, setProgressNotes] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [progressImages, setProgressImages] = useState<File[]>([]);
  const [completionImages, setCompletionImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      claimed: { variant: "secondary" as const, text: "Claimed", color: "bg-yellow-100 text-yellow-800" },
      in_progress: { variant: "default" as const, text: "In Progress", color: "bg-blue-100 text-blue-800" },
      completed: { variant: "default" as const, text: "Completed", color: "bg-green-100 text-green-800" },
      abandoned: { variant: "destructive" as const, text: "Abandoned", color: "bg-red-100 text-red-800" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.claimed;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "claimed": return 25;
      case "in_progress": return 60;
      case "completed": return 100;
      default: return 0;
    }
  };

  const handleProgressUpdate = async () => {
    if (!progressNotes.trim() && progressImages.length === 0) return;
    
    setUploading(true);
    try {
      await onProgressUpdate({ notes: progressNotes, images: progressImages });
      setProgressNotes("");
      setProgressImages([]);
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!completionNotes.trim() || completionImages.length === 0) return;
    
    setCompleting(true);
    try {
      await onComplete({ notes: completionNotes, images: completionImages });
      setShowCompletionForm(false);
      setCompletionNotes("");
      setCompletionImages([]);
    } catch (error) {
      console.error("Failed to complete fix:", error);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Fix Progress
            </CardTitle>
            <CardDescription>
              Fixing: {experienceTitle}
            </CardDescription>
          </div>
          {getStatusBadge(fixData.status)}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{getProgressPercentage(fixData.status)}%</span>
          </div>
          <Progress value={getProgressPercentage(fixData.status)} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Fix Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>Fixer: {fixData.claimerName || fixData.claimedBy}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Claimed: {new Date(fixData.claimedAt).toLocaleDateString()}</span>
          </div>
          {fixData.startedAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Started: {new Date(fixData.startedAt).toLocaleDateString()}</span>
            </div>
          )}
          {fixData.completedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Completed: {new Date(fixData.completedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Claim Notes */}
        {fixData.claimNotes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Fix Plan
            </h4>
            <p className="text-sm text-gray-700">{fixData.claimNotes}</p>
          </div>
        )}

        {/* Progress Images */}
        {fixData.progressImages && fixData.progressImages.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Progress Photos ({fixData.progressImages.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {fixData.progressImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt="Progress"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Update Form (for fix owner) */}
        {isOwner && fixData.status !== "completed" && fixData.status !== "abandoned" && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Update Progress</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="progress-notes">Progress Notes</Label>
                <Textarea
                  id="progress-notes"
                  placeholder="What progress have you made?"
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              
              <div>
                <Label htmlFor="progress-images" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Progress Photos
                </Label>
                <input
                  id="progress-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && setProgressImages(Array.from(e.target.files))}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleProgressUpdate}
                  disabled={uploading || (!progressNotes.trim() && progressImages.length === 0)}
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Update Progress"}
                </Button>
                
                {fixData.status === "in_progress" && (
                  <Button 
                    onClick={() => setShowCompletionForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion Form */}
        {showCompletionForm && isOwner && (
          <div className="border-t pt-4 bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Mark Fix Complete
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="completion-notes">Completion Summary *</Label>
                <Textarea
                  id="completion-notes"
                  placeholder="Describe what you fixed and how..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="after-images" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  After Photos * (Required)
                </Label>
                <input
                  id="after-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && setCompletionImages(Array.from(e.target.files))}
                  className="w-full p-2 border rounded-md"
                />
                {completionImages.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {completionImages.length} image(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowCompletionForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleComplete}
                  disabled={completing || !completionNotes.trim() || completionImages.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {completing ? "Submitting..." : "Submit Completion"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Summary */}
        {fixData.status === "completed" && fixData.fixNotes && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Fix Completed
            </h4>
            <p className="text-sm text-gray-700">{fixData.fixNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}