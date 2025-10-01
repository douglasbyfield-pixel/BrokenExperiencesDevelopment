"use client";

import { useState } from "react";

interface ShareResult {
  shareUrl: string;
  experienceId: string;
  title: string;
}

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const generateShareLink = async (experienceId: string): Promise<ShareResult | null> => {
    try {
      setIsSharing(true);
      
      // Generate shareable URL directly on client side
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared/experience/${experienceId}`;
      
      // For now, we'll use a simple approach - the shared page will fetch the data
      return {
        shareUrl,
        experienceId,
        title: "Shared Experience"
      };
    } catch (error) {
      console.error("Error generating share link:", error);
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  };

  const shareToWhatsApp = (text: string, url?: string) => {
    const shareText = url ? `${text}\n\n${url}` : text;
    
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use the WhatsApp app directly on mobile
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
      window.location.href = whatsappUrl;
    } else {
      // Use WhatsApp Web on desktop
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const shareToTwitter = (text: string, url?: string) => {
    const shareText = url ? `${text} ${url}` : text;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToFacebook = (url: string) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const shareViaWebShare = async (title: string, text: string, url: string): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        return true;
      } catch (error) {
        console.error("Web Share API failed:", error);
        return false;
      }
    }
    return false;
  };

  return {
    isSharing,
    generateShareLink,
    copyToClipboard,
    shareToWhatsApp,
    shareToTwitter,
    shareToFacebook,
    shareViaWebShare,
  };
}
