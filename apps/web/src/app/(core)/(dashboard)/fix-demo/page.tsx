"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Button } from "@web/components/ui/button";
import { Badge } from "@web/components/ui/badge";
import { ClaimFixDialog, FixProgressTracker, FixStatusIndicator } from "@web/components/fix";
import { VerifyFixDialog } from "@web/components/verification";
import { 
  MapPin, 
  Calendar, 
  User,
  Star,
  Eye
} from "lucide-react";

// Mock data for demonstration
const mockExperience = {
  id: "exp-1",
  title: "Broken streetlight on Main Street",
  description: "The streetlight at the corner of Main St and Oak Ave has been out for weeks, making it dangerous for pedestrians at night.",
  status: "reported",
  priority: "high",
  categoryId: "cat-1",
  categoryName: "Infrastructure",
  reportedBy: {
    id: "user-1",
    name: "Ms. Mavis Thompson",
    email: "mavis@example.com",
    image: undefined
  },
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    address: "Main St & Oak Ave, Downtown"
  },
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  experienceImages: [
    {
      id: "img-1",
      imageUrl: "/api/placeholder/400/300",
      uploadedAt: new Date().toISOString()
    }
  ],
  votes: 15,
  voteType: null
};

const mockFixData = {
  id: "fix-1",
  experienceId: "exp-1",
  claimedBy: "user-2",
  claimerName: "John the Electrician",
  status: "in_progress" as "in_progress" | "claimed" | "completed" | "abandoned",
  claimedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  completedAt: undefined as string | undefined,
  claimNotes: "I have the tools and experience to fix this streetlight. Will coordinate with the city for power shutoff and replace the burnt-out bulb and damaged wiring.",
  fixNotes: undefined as string | undefined,
  progressImages: [
    {
      id: "prog-1",
      url: "/api/placeholder/300/200",
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Inspected the light - found damaged wiring"
    },
    {
      id: "prog-2", 
      url: "/api/placeholder/300/200",
      uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      notes: "Ordered replacement parts"
    }
  ]
};

const mockVerifications = [
  {
    id: "ver-1",
    experienceId: "exp-1",
    verifiedBy: "user-3",
    verifierName: "Community Member",
    verificationType: "community_member" as const,
    verificationStatus: "resolved" as const,
    verificationNotes: "Light is working perfectly now!",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export default function FixDemoPage() {
  const [currentUser] = useState({
    id: "user-1", // Ms. Mavis (original reporter)
    name: "Ms. Mavis Thompson",
    email: "mavis@example.com"
  });

  const [experienceState, setExperienceState] = useState(mockExperience);
  const [fixState, setFixState] = useState(mockFixData);
  const [verificationsState, setVerificationsState] = useState(mockVerifications);
  const [showDifferentStates, setShowDifferentStates] = useState(false);

  // Mock handlers
  const handleClaimFix = async (data: { claimNotes: string; beforeImages: File[] }) => {
    console.log("Claiming fix:", data);
    alert("Fix claimed! (This is a demo - no actual backend integration)");
  };

  const handleProgressUpdate = async (data: { notes: string; images: File[] }) => {
    console.log("Progress update:", data);
    alert("Progress updated! (This is a demo)");
  };

  const handleComplete = async (data: { notes: string; images: File[] }) => {
    console.log("Completing fix:", data);
    setFixState({
      ...fixState,
      status: "completed",
      completedAt: new Date().toISOString(),
      fixNotes: data.notes
    });
    alert("Fix marked as complete!");
  };

  const handleVerify = async (data: any) => {
    console.log("Verifying fix:", data);
    const newVerification = {
      id: `ver-${Date.now()}`,
      experienceId: experienceState.id,
      verifiedBy: currentUser.id,
      verifierName: currentUser.name,
      verificationType: data.verificationType,
      verificationStatus: data.verificationStatus,
      verificationNotes: data.verificationNotes,
      createdAt: new Date().toISOString()
    };
    setVerificationsState([...verificationsState, newVerification]);
    alert("Verification submitted!");
  };

  const demoStates = [
    {
      name: "Available to Fix",
      fix: null,
      verifications: []
    },
    {
      name: "Claimed",
      fix: { ...mockFixData, status: "claimed" as const, startedAt: undefined, progressImages: [] },
      verifications: []
    },
    {
      name: "In Progress",
      fix: mockFixData,
      verifications: []
    },
    {
      name: "Completed (Awaiting Verification)",
      fix: { ...mockFixData, status: "completed" as const, completedAt: new Date().toISOString() },
      verifications: []
    },
    {
      name: "Verified by Community",
      fix: { ...mockFixData, status: "completed" as const, completedAt: new Date().toISOString() },
      verifications: [mockVerifications[0]]
    },
    {
      name: "Verified by Original Reporter",
      fix: { ...mockFixData, status: "completed" as const, completedAt: new Date().toISOString() },
      verifications: [
        { ...mockVerifications[0], verificationType: "original_reporter" as const, verifierName: "Ms. Mavis Thompson" }
      ]
    }
  ];

  const isOriginalReporter = currentUser.id === experienceState.reportedBy?.id;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Fix & Verification System Demo</h1>
          <p className="text-gray-600">Experience the complete workflow from reporting to verification</p>
          <Badge className="bg-blue-100 text-blue-800">
            <Eye className="mr-1 h-3 w-3" />
            You are viewing as: {currentUser.name} {isOriginalReporter && "(Original Reporter)"}
          </Badge>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={!showDifferentStates ? "default" : "outline"}
                onClick={() => setShowDifferentStates(false)}
              >
                Interactive Demo
              </Button>
              <Button 
                variant={showDifferentStates ? "default" : "outline"}
                onClick={() => setShowDifferentStates(true)}
              >
                View All States
              </Button>
            </div>
          </CardContent>
        </Card>

        {!showDifferentStates ? (
          <>
            {/* Original Experience Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{experienceState.title}</CardTitle>
                    <p className="text-gray-600">{experienceState.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {experienceState.reportedBy?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(experienceState.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {experienceState.location.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                    <Badge variant="outline">{experienceState.categoryName}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Fix Status Indicator */}
                <FixStatusIndicator
                  experience={experienceState}
                  fixes={fixState ? [fixState] : []}
                  verifications={verificationsState}
                  isOriginalReporter={isOriginalReporter}
                  onClaimFix={() => {}}
                  onVerifyFix={() => {}}
                />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <ClaimFixDialog
                    experienceId={experienceState.id}
                    experienceTitle={experienceState.title}
                    onClaim={handleClaimFix}
                  />
                  
                  {fixState?.status === "completed" && (
                    <VerifyFixDialog
                      experienceId={experienceState.id}
                      experienceTitle={experienceState.title}
                      fixerName={fixState.claimerName || "Unknown Fixer"}
                      isOriginalReporter={isOriginalReporter}
                      experienceLocation={experienceState.location}
                      onVerify={handleVerify}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fix Progress Tracker */}
            {fixState && (
              <FixProgressTracker
                fixData={fixState}
                experienceTitle={experienceState.title}
                isOwner={currentUser.id === fixState.claimedBy}
                onProgressUpdate={handleProgressUpdate}
                onComplete={handleComplete}
              />
            )}

            {/* Verifications Summary */}
            {verificationsState.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Community Verifications ({verificationsState.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {verificationsState.map((verification) => (
                      <div key={verification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{verification.verifierName}</span>
                            <Badge 
                              className={
                                verification.verificationType === "community_member" 
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {verification.verificationType === "community_member" ? "Community" : "Original Reporter"}
                            </Badge>
                            <Badge 
                              className={
                                verification.verificationStatus === "resolved"
                                  ? "bg-green-100 text-green-800"
                                  : verification.verificationStatus === "still_there"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {verification.verificationStatus.replace("_", " ")}
                            </Badge>
                          </div>
                          {verification.verificationNotes && (
                            <p className="text-sm text-gray-600">{verification.verificationNotes}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(verification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* All States Demo */
          <div className="grid gap-4">
            {demoStates.map((state, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{state.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FixStatusIndicator
                    experience={experienceState}
                    fixes={state.fix ? [state.fix] : []}
                    verifications={state.verifications}
                    isOriginalReporter={isOriginalReporter}
                    onClaimFix={() => alert(`Demo: ${state.name} - Claim Fix clicked`)}
                    onVerifyFix={() => alert(`Demo: ${state.name} - Verify Fix clicked`)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}