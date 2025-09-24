import React, { useRef, useState, useEffect } from 'react'
import { Camera, Upload, Type, X } from 'lucide-react'

interface ExperienceTypeSelectionProps {
  onSelect: (type: 'camera' | 'upload' | 'text', files?: File[]) => void
}

export function ExperienceTypeSelection({ onSelect }: ExperienceTypeSelectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Handle video stream when component mounts or stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(console.error)
    }
  }, [stream])

  const handleCameraClick = async () => {
    try {
      // Check if getUserMedia is supported
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Use rear camera
          } 
        })
        setStream(mediaStream)
        setShowCamera(true)
      } else {
        // Fallback to file input with camera capture
        cameraInputRef.current?.click()
      }
    } catch (error) {
      console.error('Camera access denied or not available:', error)
      // Fallback to file input
      cameraInputRef.current?.click()
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
            onSelect('camera', [file])
          }
          closeCamera()
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      onSelect('camera', files)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      onSelect('upload', files)
    }
  }

  // Camera interface
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black text-white z-50">
        {/* Camera video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Camera controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={closeCamera}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
            >
              <Camera className="w-8 h-8 text-black" />
            </button>
            
            <div className="w-12 h-12"></div> {/* Spacer for centering */}
          </div>
        </div>
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white text-black px-3">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex py-6 gap-3">
        {/* Capture */}
        <button
          onClick={handleCameraClick}
          className="flex-1 flex flex-col items-center gap-2"
        >
          <div className="w-full h-16 border rounded-lg flex flex-col py-3 items-center justify-center gap-1">
            <Camera className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium text-black">Capture</span>
          </div>
        </button>

        {/* Upload */}
        <button
          onClick={handleUploadClick}
          className="flex-1 flex flex-col items-center gap-2"
        >
          <div className="w-full h-16 border rounded-lg flex flex-col py-3 items-center justify-center gap-1">
            <Upload className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium text-black">Upload</span>
          </div>
        </button>

        {/* Describe */}
        <button
          onClick={() => onSelect('text')}
          className="flex-1 flex flex-col items-center gap-2"
        >
          <div className="w-full h-16 border rounded-lg flex flex-col py-3 items-center justify-center gap-1">
            <Type className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium text-black">Describe</span>
          </div>
        </button>
      </div>
    </div>
  )
}
