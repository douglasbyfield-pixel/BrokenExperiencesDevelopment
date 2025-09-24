import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, Camera, MapPin, Navigation, Image } from 'lucide-react'

const categories = [
  'Security',
  'Transportation', 
  'Public space',
  'Safety',
  'Infrastructure',
  'Health',
  'Environment',
  'Public utilities',
  'Sanitation',
  'Miscellaneous'
]

interface ExperienceFormProps {
  contentType: 'camera' | 'upload' | 'text'
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  onSubmit: (data: {
    description: string
    photos: string[]
    categories: string[]
    location?: { lat: number; lng: number }
  }) => void
}

export function ExperienceForm({ 
  contentType, 
  photos, 
  onPhotosChange, 
  onSubmit 
}: ExperienceFormProps) {
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Security', 'Transportation', 'Public space'])
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationName, setLocationName] = useState('')

  const addPhoto = () => {
    const newPhotos = [...photos, `photo-${Date.now()}`]
    onPhotosChange(newPhotos)
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setLocationName(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationName('Unable to get location')
        }
      )
    } else {
      setLocationName('Geolocation not supported')
    }
  }

  const handleSubmit = () => {
    onSubmit({
      description,
      photos,
      categories: selectedCategories,
      location: currentLocation || undefined
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Show selected content */}
      {contentType !== 'text' && photos.length > 0 && (
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Selected content</Label>
          <div className="flex gap-3">
            {/* Existing photos */}
            {photos.map((photo, index) => (
              <div key={photo} className="relative">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {photo.startsWith('blob:') ? (
                    <img 
                      src={photo} 
                      alt={`Selected ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* Add photo button */}
            <button
              onClick={addPhoto}
              className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs mt-1">Add photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground font-medium">Tell us what's broken</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Start typing your message"
          className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>

      {/* Location/Map Section */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium">Where is this happening?</Label>
        
        {/* Map placeholder */}
        <div className="w-full h-48 bg-muted rounded-lg border border-border flex items-center justify-center">
          {currentLocation ? (
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-foreground font-medium">Location captured</p>
              <p className="text-xs text-muted-foreground">{locationName}</p>
            </div>
          ) : (
            <div className="text-center">
              <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No location set</p>
            </div>
          )}
        </div>
        
        {/* Location button */}
        <Button
          onClick={getCurrentLocation}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {currentLocation ? 'Update Location' : 'Use Current Location'}
        </Button>
      </div>

      {/* Categories - Only show after description is typed */}
      {description.trim().length > 0 && (
        <div className="space-y-3">
          <Label className="text-foreground font-medium">How would you categories this issue?</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      <div className="pb-4">
        <Button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700"
        >
          Submit report
        </Button>
      </div>
    </div>
  )
}
