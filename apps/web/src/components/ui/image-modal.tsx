"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";
import { Button } from "./button";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ImageModal({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose, 
  onIndexChange 
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) {
            onIndexChange(currentIndex + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Image from Broken Experiences',
          url: currentImage,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentImage);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation Buttons */}
        {hasPrevious && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-20 text-white hover:bg-white/20"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-20 text-white hover:bg-white/20"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Image Container */}
        <div className="relative flex items-center justify-center w-full h-full">
          <img
            src={currentImage}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
              <div className="text-white text-lg">Loading...</div>
            </div>
          )}
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleDownload}
            title="Download image"
          >
            <Download className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleShare}
            title="Share image"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Thumbnail Strip (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-white shadow-lg' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
