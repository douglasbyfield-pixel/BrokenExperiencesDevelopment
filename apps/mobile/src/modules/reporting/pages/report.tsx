import { useState, useEffect } from 'react'
import { ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { ExperienceTypeSelection } from '../components/experience-type-selection'
import { ExperienceForm } from '../components/experience-form'
import { useCreateReport } from '../hooks/useCreateReport'
import { GoogleMap } from '../../map/components/google-map'

export function ReportPage() {
  const [showContentSelection, setShowContentSelection] = useState(true)
  const [selectedContentType, setSelectedContentType] = useState<'camera' | 'upload' | 'text' | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationName, setLocationName] = useState<string>('')

  const createReportMutation = useCreateReport()

  // Capture location on mount
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setLocationName("Geolocation not supported")
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = { lat: latitude, lng: longitude }
          setCurrentLocation(location)
          setLocationName(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        },
        () => {
          setLocationName("Unable to get location")
        }
      )
    }

    getCurrentLocation()
  }, [])

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

  const handleFormSubmit = async (data: {
    description: string
    photos: string[]
    categories: string[]
    location?: { lat: number; lng: number }
  }) => {
    const reportData = {
      description: data.description,
      categories: data.categories,
      latitude: currentLocation?.lat.toString(),
      longitude: currentLocation?.lng.toString(),
      images: selectedFiles,
    }

    createReportMutation.mutate(reportData, {
      onSuccess: (response) => {
        if (response.data) {
          setSubmittedReportId(response.data.id)
          setReportSubmitted(true)
        }
      },
      onError: (error) => {
        console.error('Error submitting report:', error)
      },
    })
  }

  const handleBackToStart = () => {
    setShowContentSelection(true)
    setSelectedContentType(null)
    setPhotos([])
    setSelectedFiles([])
    setReportSubmitted(false)
    setSubmittedReportId(null)
    createReportMutation.reset()
  }

  // Show success screen after report submission
  if (reportSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-white text-black">
          <button onClick={handleBackToStart} className="text-black font-medium">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Report Submitted</h1>
          <div className="w-6"></div>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6 max-w-sm">
            Your report has been submitted and is now visible to others in your area. 
            Once verified by the community, it will be visible globally.
          </p>
          
          {submittedReportId && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <p className="text-sm text-gray-500">Report ID</p>
              <p className="text-sm font-mono text-gray-700">{submittedReportId}</p>
            </div>
          )}
          
          <button
            onClick={handleBackToStart}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-white text-black">
        <button 
          onClick={showContentSelection ? undefined : () => setShowContentSelection(true)}
          className="text-black font-medium"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Report broken experience</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Error Display */}
      {createReportMutation.error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error submitting report</p>
            <p className="text-sm text-red-600 mt-1">{createReportMutation.error.message}</p>
            <button
              onClick={() => createReportMutation.reset()}
              className="text-sm text-red-600 underline mt-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showContentSelection ? (
        <ExperienceTypeSelection onSelect={handleContentTypeSelection} />
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <ExperienceForm
              contentType={selectedContentType!}
              photos={photos}
              onPhotosChange={setPhotos}
              onSubmit={handleFormSubmit}
              isLoading={createReportMutation.isPending}
              location={currentLocation || undefined}
            />
          </div>
          
          {/* Map showing current location */}
          <div className="h-48 border-t border-border">
            <GoogleMap
              center={currentLocation || { lat: 0, lng: 0 }}
              zoom={15}
              height="100%"
              width="100%"
              showMarker={!!currentLocation}
              markerColor="#3b82f6"
              markerBorderColor="#1e40af"
              markerGlyphColor="#fff"
              isLoading={!currentLocation}
              loadingMessage={locationName || 'Loading location...'}
            />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {createReportMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Submitting report...</span>
          </div>
        </div>
      )}
    </div>
  )
}
