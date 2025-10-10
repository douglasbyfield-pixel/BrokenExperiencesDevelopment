"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@web/components/auth-provider";
import { Button } from "@web/components/ui/button";
import { ArrowLeft, Wrench, MapPin, Clock, CheckCircle } from "lucide-react";
import { createClient } from "@web/lib/supabase/client";

interface Fix {
  id: string;
  status: "claimed" | "in_progress" | "completed" | "verified";
  claimNotes?: string;
  createdAt: string;
  claimedAt?: string;
  experienceId: string;
  claimedBy: string;
  experience: {
    id: string;
    title: string;
    description: string;
    address?: string;
    upvotes: number;
    status: string;
    experienceImages?: Array<{ imageUrl: string }>;
  };
}

export default function MyFixesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [fixes, setFixes] = useState<Fix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchMyFixes();
  }, [user, router]);

  const fetchMyFixes = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
      
      const response = await fetch(`${apiUrl}/experience/fixes/user/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fixes: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Debug: Check what timestamp fields we have
      if (data.length > 0) {
        console.log("🔧 Fix timestamp debug:", {
          sampleFix: data[0],
          claimedAt: data[0].claimedAt,
          createdAt: data[0].createdAt,
          allFields: Object.keys(data[0])
        });
      }
      
      // Filter to ensure we only show fixes that actually belong to this user
      const validFixes = data.filter((fix: any) => fix.claimedBy === user.id);
      
      setFixes(validFixes);
    } catch (error) {
      console.error("Failed to fetch fixes:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 24) {
      return diffInHours < 1 ? "Just now" : `${diffInHours}h ago`;
    }
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "claimed": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "verified": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
            <h1 className="font-semibold text-gray-900">My Fixes</h1>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3 p-4 border border-gray-100 rounded-lg">
                <div className="h-16 w-16 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
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
          <h1 className="font-semibold text-gray-900">My Fixes</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {fixes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fixes yet</h3>
            <p className="text-gray-600 mb-6">Start fixing issues in your community to see them here.</p>
            <Button
              onClick={() => router.push("/home")}
              className="bg-black text-white hover:bg-gray-800"
            >
              Browse Issues
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {fixes.map((fix) => {

              const realImages = fix.experience.experienceImages?.filter(
                (img: any) =>
                  img.imageUrl &&
                  img.imageUrl.trim() !== "" &&
                  !img.imageUrl.includes("placeholder") &&
                  img.imageUrl.startsWith("http")
              ) || [];

              return (
                <div
                  key={fix.id}
                  className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors cursor-pointer"
                  onClick={() => router.push(`/experience/${fix.experience.id}/claim-fix`)}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {realImages.length > 0 ? (
                        <img
                          src={realImages[0].imageUrl}
                          alt="Issue"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg truncate pr-2">
                          {fix.experience.title || "Issue Report"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(fix.status)}`}>
                          {fix.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {fix.experience.description}
                      </p>

                      {/* Two rows for better layout */}
                      <div className="space-y-2">
                        {/* First row: Address */}
                        {fix.experience.address && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{fix.experience.address}</span>
                          </div>
                        )}
                        
                        {/* Second row: Cosigns and Claimed time */}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4" />
                            <span>{fix.experience.upvotes || 0} cosigns</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>Claimed {formatRelativeTime(fix.claimedAt || fix.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}