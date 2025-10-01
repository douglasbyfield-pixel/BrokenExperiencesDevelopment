"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@web/components/ui/avatar";
import { Button } from "@web/components/ui/button";
import { ImageModal } from "@web/components/ui/image-modal";
import { MapPin, Calendar } from "lucide-react";
import Link from "next/link";

interface SharedExperienceClientProps {
  experience: any;
  displayName: string;
  formatRelativeTime: (date: string) => string;
}

export default function SharedExperienceClient({ 
  experience, 
  displayName, 
  formatRelativeTime 
}: SharedExperienceClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Filter out broken images and placeholders
  const validImages = experience.experienceImages?.filter(
    (img: any) => img.imageUrl && 
      img.imageUrl.trim() !== '' && 
      !img.imageUrl.includes('placeholder') &&
      !img.imageUrl.includes('null') &&
      !img.imageUrl.includes('undefined') &&
      img.imageUrl.startsWith('http')
  ) || [];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageIndex(null);
  };

  const handleImageIndexChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <>
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
              {validImages.length > 0 && (
                <div className="mb-6">
                  {validImages.length === 1 ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={validImages[0].imageUrl}
                        alt="Experience"
                        className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        style={{ objectPosition: 'center 20%' }}
                        onClick={() => handleImageClick(0)}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                      {validImages.slice(0, 4).map((img: any, idx: number) => (
                        <div key={img.id} className="relative">
                          <img 
                            src={img.imageUrl}
                            alt={`Experience ${idx + 1}`}
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            style={{ objectPosition: 'center 25%' }}
                            onClick={() => handleImageClick(idx)}
                          />
                          {idx === 3 && validImages.length > 4 && (
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition-all"
                              onClick={() => handleImageClick(3)}
                            >
                              <span className="text-white font-semibold">+{validImages.length - 4} more</span>
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

              {/* Stats - NO UPVOTES, only reported date */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
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

      {/* Image Modal */}
      {validImages.length > 0 && (
        <ImageModal
          images={validImages.map((img: any) => img.imageUrl)}
          currentIndex={selectedImageIndex || 0}
          isOpen={isImageModalOpen}
          onClose={handleCloseImageModal}
          onIndexChange={handleImageIndexChange}
        />
      )}
    </>
  );
}
