"use client";

import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  Users
} from "lucide-react";

interface FixStatusIndicatorProps {
  experience: {
    id: string;
    title: string;
    status?: string;
  };
  fixes?: Array<{
    id: string;
    status: "claimed" | "in_progress" | "completed" | "abandoned";
    claimedBy: string;
    claimerName?: string;
    claimedAt: string;
    completedAt?: string;
  }>;
  verifications?: Array<{
    id: string;
    verificationStatus: "resolved" | "still_there" | "incomplete" | "pending";
    verifiedBy: string;
    verificationType: "original_reporter" | "community_member";
  }>;
  isOriginalReporter?: boolean;
  onClaimFix?: () => void;
  onVerifyFix?: () => void;
  className?: string;
}

export function FixStatusIndicator({ 
  experience,
  fixes = [],
  verifications = [],
  isOriginalReporter = false,
  onClaimFix,
  onVerifyFix,
  className = ""
}: FixStatusIndicatorProps) {
  // Get the most recent active fix
  const activeFix = fixes
    .filter(fix => fix.status !== "abandoned")
    .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())[0];

  // Get verification summary
  const resolvedVerifications = verifications.filter(v => v.verificationStatus === "resolved");
  const pendingVerifications = verifications.filter(v => v.verificationStatus === "pending");
  const hasOriginalReporterVerification = verifications.some(
    v => v.verificationType === "original_reporter" && v.verificationStatus === "resolved"
  );

  // Determine overall status
  const getOverallStatus = () => {
    if (!activeFix) return "available"; // No one claimed it
    
    if (activeFix.status === "completed") {
      if (resolvedVerifications.length > 0) {
        return hasOriginalReporterVerification ? "verified_by_reporter" : "verified_by_community";
      }
      return "awaiting_verification";
    }
    
    return activeFix.status;
  };

  const overallStatus = getOverallStatus();

  // Status configurations
  const statusConfig = {
    available: {
      badge: { text: "Available to Fix", className: "bg-green-100 text-green-800" },
      icon: Wrench,
      showClaimButton: true,
      showVerifyButton: false
    },
    claimed: {
      badge: { text: `Claimed by ${activeFix?.claimerName || "Someone"}`, className: "bg-yellow-100 text-yellow-800" },
      icon: Clock,
      showClaimButton: true, // Multiple people can claim
      showVerifyButton: false
    },
    in_progress: {
      badge: { text: `In Progress - ${activeFix?.claimerName || "Someone"}`, className: "bg-blue-100 text-blue-800" },
      icon: Clock,
      showClaimButton: true,
      showVerifyButton: false
    },
    completed: {
      badge: { text: `Completed by ${activeFix?.claimerName || "Someone"}`, className: "bg-purple-100 text-purple-800" },
      icon: CheckCircle,
      showClaimButton: false,
      showVerifyButton: false // Will be overridden below
    },
    awaiting_verification: {
      badge: { text: "Awaiting Verification", className: "bg-orange-100 text-orange-800" },
      icon: Shield,
      showClaimButton: false,
      showVerifyButton: true
    },
    verified_by_community: {
      badge: { text: `Verified Fixed (${resolvedVerifications.length})`, className: "bg-green-100 text-green-800" },
      icon: CheckCircle,
      showClaimButton: false,
      showVerifyButton: true
    },
    verified_by_reporter: {
      badge: { text: "✓ Verified by Original Reporter", className: "bg-green-100 text-green-800 font-medium" },
      icon: CheckCircle,
      showClaimButton: false,
      showVerifyButton: false
    }
  };

  const config = statusConfig[overallStatus as keyof typeof statusConfig] || statusConfig.available;
  const IconComponent = config.icon;

  // For completed fixes, always show verify button unless verified by reporter
  if (overallStatus === "completed" || overallStatus === "verified_by_community") {
    config.showVerifyButton = overallStatus !== "verified_by_reporter";
  }

  return (
    <div className={`flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <IconComponent className="h-4 w-4 text-gray-600 flex-shrink-0" />
        <Badge className={`${config.badge.className} text-xs`}>
          {config.badge.text}
        </Badge>
        
        {/* Additional info */}
        {fixes.length > 1 && (
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {fixes.length} fixers
          </Badge>
        )}
        
        {verifications.length > 0 && overallStatus !== "verified_by_reporter" && (
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            {verifications.length} verified
          </Badge>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 flex-shrink-0">
        {config.showClaimButton && onClaimFix && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onClaimFix}
            className="h-7 px-2 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <Wrench className="h-3 w-3 mr-1" />
            {activeFix ? "Join Fix" : "Claim"}
          </Button>
        )}
        
        {config.showVerifyButton && onVerifyFix && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onVerifyFix}
            className="h-7 px-2 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Shield className="h-3 w-3 mr-1" />
            {isOriginalReporter ? "Verify" : "Check"}
          </Button>
        )}
      </div>
    </div>
  );
}