"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CameraCapture({ onCapture, onClose, isOpen }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);

  // Handle video stream when component mounts or stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      // Check if getUserMedia is supported
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Use rear camera
          } 
        });
        setStream(mediaStream);
      } else {
        setError('Camera not supported on this device');
      }
    } catch (error) {
      console.error('Camera access denied or not available:', error);
      setError('Camera access denied. Please allow camera access to take photos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // Create preview URL for captured image
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImages(prev => [...prev, imageUrl]);
            
            // Show capture flash effect
            setShowCaptureFlash(true);
            setTimeout(() => setShowCaptureFlash(false), 150);
            
            onCapture(file);
            // Don't automatically close - let user stay on camera screen
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    // Cleanup image URLs to prevent memory leaks
    capturedImages.forEach(url => URL.revokeObjectURL(url));
    setCapturedImages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Take Photo</h2>
          {capturedImages.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="font-medium">{capturedImages.length}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Camera video */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Flash effect */}
            {showCaptureFlash && (
              <div className="absolute inset-0 bg-white pointer-events-none animate-pulse" />
            )}
            
            {/* Recent captures thumbnail strip */}
            {capturedImages.length > 0 && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                {capturedImages.slice(-3).map((imageUrl, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/50 bg-black/20"
                  >
                    <img
                      src={imageUrl}
                      alt={`Captured ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {capturedImages.length > 3 && (
                  <div className="w-12 h-12 rounded-lg border-2 border-white/50 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs">+{capturedImages.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Camera controls */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center">
          <button
            onClick={capturePhoto}
            disabled={!!error}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-8 h-8 text-black" />
          </button>
        </div>
      </div>
      
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
