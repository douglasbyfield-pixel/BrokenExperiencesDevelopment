import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ExperienceTypeSelection } from '../components/experience-type-selection'
import { ExperienceForm } from '../components/experience-form'

export function ReportPage() {
  const [showContentSelection, setShowContentSelection] = useState(true)
  const [selectedContentType, setSelectedContentType] = useState<'camera' | 'upload' | 'text' | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleContentTypeSelection = (type: 'camera' | 'upload' | 'text', files?: File[]) => {
    setSelectedContentType(type)
    if (files && files.length > 0) {
      setSelectedFiles(files)
      // Create object URLs for preview
      const urls = files.map(file => URL.createObjectURL(file))
      setPhotos(urls)
    } else if (type === 'text') {
      setPhotos([])
      setSelectedFiles([])
    }
    setShowContentSelection(false)
  }

  const handleFormSubmit = (data: {
    description: string
    photos: string[]
    categories: string[]
    location?: { lat: number; lng: number }
  }) => {
    console.log('Report submitted:', data)
    // Handle form submission here
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-white text-black">
        <button className="text-black font-medium">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Report broken experience</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {showContentSelection ? (
        <ExperienceTypeSelection onSelect={handleContentTypeSelection} />
      ) : (
        <ExperienceForm
          contentType={selectedContentType!}
          photos={photos}
          onPhotosChange={setPhotos}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  )
}
