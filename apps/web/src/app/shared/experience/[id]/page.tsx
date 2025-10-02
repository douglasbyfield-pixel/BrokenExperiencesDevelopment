"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import { useExperience } from "@web/hooks/use-experiences";
import SharedExperienceClient from "./shared-experience-client";

interface SharedExperiencePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SharedExperiencePage({ params }: SharedExperiencePageProps) {
  const { id } = use(params);
  const { data: experience, isLoading, error } = useExperience(id);

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

  const displayName = experience?.reportedBy?.name || experience?.reportedBy?.email?.split('@')[0] || "Anonymous";

  if (isLoading) {
    return (
      <div className="mx-auto">
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

  return (
    <SharedExperienceClient 
      experience={experience}
      displayName={displayName}
      formatRelativeTime={formatRelativeTime}
    />
  );
}