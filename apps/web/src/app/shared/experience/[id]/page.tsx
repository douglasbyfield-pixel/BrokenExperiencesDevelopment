"use client";

import React, { use, useState } from "react";
import { notFound } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { ImageModal } from "@web/components/ui/image-modal";
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
  
  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

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
      {(() => {
        // Filter out placeholder images - only show real uploaded images
        const realImages = experience.experienceImages?.filter(
          (img: any) => img.imageUrl && img.imageUrl.trim() !== '' && !img.imageUrl.includes('placeholder')
        ) || [];
        
        if (realImages.length === 0) return null;
        
        return (
          <div className="px-4 pb-3">
            <div className={`rounded-xl overflow-hidden ${
              realImages.length === 1 ? 'max-w-full' : 'max-w-full'
            }`}>
              {realImages.length === 1 ? (
                /* Single image - full width */
                <img 
                  src={realImages[0].imageUrl}
                  alt="Experience"
                  className="w-full h-auto max-h-[32rem] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  loading="lazy"
                  onClick={(e) => handleImageClick(e, 0)}
                />
              ) : realImages.length === 2 ? (
                /* Two images - side by side */
                <div className="grid grid-cols-2 gap-1 w-full">
                  {realImages.map((img: any, idx: number) => (
                    <img 
                      key={idx}
                      src={img.imageUrl}
                      alt={`Experience ${idx + 1}`}
                      className="w-full h-56 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      loading="lazy"
                      onClick={(e) => handleImageClick(e, idx)}
                    />
                  ))}
                </div>
              ) : realImages.length === 3 ? (
                /* Three images - one large, two small */
                <div className="grid grid-cols-2 gap-1 w-full">
                  <img 
                    src={realImages[0].imageUrl}
                    alt="Experience 1"
                    className="w-full h-full min-h-[28rem] object-cover row-span-2 cursor-pointer hover:opacity-95 transition-opacity"
                    loading="lazy"
                    onClick={(e) => handleImageClick(e, 0)}
                  />
                  <div className="flex flex-col gap-1">
                    <img 
                      src={realImages[1].imageUrl}
                      alt="Experience 2"
                      className="w-full h-[13.875rem] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      loading="lazy"
                      onClick={(e) => handleImageClick(e, 1)}
                    />
                    <img 
                      src={realImages[2].imageUrl}
                      alt="Experience 3"
                      className="w-full h-[13.875rem] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      loading="lazy"
                      onClick={(e) => handleImageClick(e, 2)}
                    />
                  </div>
                </div>
              ) : (
                /* Four or more images - grid of 4 */
                <div className="grid grid-cols-2 gap-1 w-full">
                  {realImages.slice(0, 4).map((img: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={img.imageUrl}
                        alt={`Experience ${idx + 1}`}
                        className="w-full h-56 object-cover cursor-pointer group-hover:opacity-95 transition-opacity"
                        loading="lazy"
                        onClick={(e) => handleImageClick(e, idx)}
                      />
                      {idx === 3 && realImages.length > 4 && (
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center cursor-pointer group-hover:bg-opacity-75 transition-all"
                          onClick={(e) => handleImageClick(e, 3)}
                        >
                          <span className="text-white text-3xl font-bold drop-shadow-lg">
                            +{realImages.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
      
      {/* Image Modal */}
      {(() => {
        const realImages = experience.experienceImages?.filter(
          (img: any) => img.imageUrl && img.imageUrl.trim() !== '' && !img.imageUrl.includes('placeholder')
        ) || [];
        
        if (realImages.length === 0) return null;
        
        return (
          <ImageModal
            images={realImages.map((img: any) => img.imageUrl)}
            currentIndex={currentImageIndex}
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            onIndexChange={setCurrentImageIndex}
          />
        );
      })()}
    </div>
  );
}
