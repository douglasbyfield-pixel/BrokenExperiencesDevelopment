import { notFound } from "next/navigation";
import { eden } from "@web/lib/eden";
import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { MapPin, Heart, Calendar, User } from "lucide-react";
import Link from "next/link";

interface SharedExperiencePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SharedExperiencePage({ params }: SharedExperiencePageProps) {
  const { id } = await params;
  try {
    // Fetch the experience data from the main experience API
    const response = await eden.experience.get({ $query: { limit: 100 } });
    
    if (!response.data || !Array.isArray(response.data)) {
      notFound();
    }

    // Find the specific experience by ID
    const experience = response.data.find(exp => exp.id === id);
    
    if (!experience) {
      notFound();
    }

    const formatRelativeTime = (date: string) => {
      const now = new Date();
      const experienceDate = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - experienceDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return experienceDate.toLocaleDateString();
    };

    const displayName = experience.reportedBy?.name || experience.reportedBy?.email?.split('@')[0] || "Anonymous";

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BE</span>
                </div>
                <span className="font-semibold">Broken Experiences</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shared Experience</h1>
            <p className="text-gray-600 mt-1">View this experience shared from Broken Experiences</p>
          </div>
        </div>

        {/* Experience Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={experience.reportedBy?.image || undefined} 
                    alt={`${displayName}'s avatar`} 
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600 font-medium">
                    {displayName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="font-semibold text-gray-900 hover:text-gray-600 transition-colors cursor-pointer">{displayName}</span>
                    <span className="text-gray-500 text-sm">@{experience.reportedBy?.email?.split('@')[0] || "user"}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500 text-sm hover:text-gray-700 transition-colors cursor-pointer">{formatRelativeTime(experience.createdAt.toString())}</span>
                  </div>
                  
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      #{experience.category?.name || "general"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-900 text-base whitespace-pre-wrap leading-relaxed mb-6">{experience.description}</p>
              
              {/* Images */}
              {experience.experienceImages && experience.experienceImages.length > 0 && (
                <div className="mb-6">
                  {experience.experienceImages.length === 1 ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={experience.experienceImages[0].imageUrl}
                        alt="Experience"
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                      {experience.experienceImages.slice(0, 4).map((img: any, idx: number) => (
                        <div key={img.id} className="relative">
                          <img 
                            src={img.imageUrl}
                            alt={`Experience ${idx + 1}`}
                            className="w-full h-48 object-cover"
                          />
                          {idx === 3 && experience.experienceImages.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-semibold">+{experience.experienceImages.length - 4} more</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              {experience.address && (
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{experience.address}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{experience.upvotes || 0} upvotes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Reported {new Date(experience.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  This experience was shared from Broken Experiences
                </p>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    View More Experiences
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching shared experience:", error);
    notFound();
  }
}
