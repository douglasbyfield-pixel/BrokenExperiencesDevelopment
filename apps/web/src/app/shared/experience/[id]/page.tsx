"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useExperience } from "@web/hooks/use-experiences";

interface SharedExperiencePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SharedExperiencePage({ params }: SharedExperiencePageProps) {
  const { id } = use(params);
  const { data: experience, isLoading, error } = useExperience(id);

  if (isLoading) {
    return (
      <div className=" mx-auto">
        <div className="animate-pulse">
          <div className="flex items-start gap-3 p-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="px-4 pb-3 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    notFound();
  }

    const formatRelativeTime = (dateString: string | Date) => {
      const now = new Date();
      const postDate = typeof dateString === 'string' ? new Date(dateString) : dateString;
      const diffInMs = now.getTime() - postDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      // Check if it's the same day
      const isSameDay = now.toDateString() === postDate.toDateString();
      
      // Check if it's yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = postDate.toDateString() === yesterday.toDateString();

      if (isSameDay) {
        if (diffInMinutes < 1) {
          return 'Just now';
        } else if (diffInMinutes < 60) {
          return `${diffInMinutes}m ago`;
        } else {
          return `${diffInHours}h ago`;
        }
      } else if (isYesterday) {
        return 'Yesterday';
      } else {
        // Format as "Sep 9" style
        return postDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    };

    const displayName = experience.reportedBy?.name || experience.reportedBy?.email?.split('@')[0] || "Anonymous";

  return (
    <div className="px-4">
      {/* Author Info */}
      <div className="flex items-start gap-3 p-4">
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
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900">{displayName}</span>
            <span className="text-gray-500 text-sm">@{experience.reportedBy?.email?.split('@')[0] || "user"}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 text-sm">{formatRelativeTime(experience.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
          {experience.description}
        </p>
      </div>
      
      {/* Images */}
      {experience.experienceImages && experience.experienceImages.length > 0 && (
        <div className="px-4 pb-3">
          {experience.experienceImages.length === 1 ? (
            <div className="rounded-2xl overflow-hidden">
              <img 
                src={experience.experienceImages[0].imageUrl}
                alt="Experience"
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
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
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{experience.address}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Shared from Broken Experiences
          </p>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
              View More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
