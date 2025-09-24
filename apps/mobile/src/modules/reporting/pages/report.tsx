import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, Camera } from 'lucide-react'

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

export function ReportPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Security', 'Transportation', 'Public space'])
  const [photos, setPhotos] = useState<string[]>([])

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const addPhoto = () => {
    // Simulate photo addition
    setPhotos(prev => [...prev, `photo-${Date.now()}`])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button className="text-foreground font-medium">Close</button>
        <h1 className="text-lg font-semibold">New report</h1>
        <div className="w-12"></div> {/* Spacer for centering */}
      </div>

      <div className="p-4 space-y-6">
        {/* Add a title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground font-medium">Add a title</Label>
          <Input
            id="title"
            placeholder="Start with a title"
            className="w-full rounded-lg border-border"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground font-medium">Description</Label>
          <textarea
            id="description"
            placeholder="Start typing your message"
            className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Add a photo */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Add a photo</Label>
          <div className="flex gap-3">
            {/* Existing photos */}
            {photos.map((photo, index) => (
              <div key={photo} className="relative">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-muted-foreground" />
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

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">How would you categories this issue?</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground border border-border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">
          Submit report
        </Button>
      </div>
    </div>
  )
}
