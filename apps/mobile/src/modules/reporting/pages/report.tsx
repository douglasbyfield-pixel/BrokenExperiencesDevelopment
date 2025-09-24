import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ReportPage() {
  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Report Issue</h1>
        <p className="text-muted-foreground">Help others by reporting broken experiences</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Brief description of the issue"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Detailed description of what's broken"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Where did this happen?"
            className="w-full"
          />
        </div>
        
        <Button className="w-full">
          📸 Take Photo
        </Button>
        
        <Button className="w-full">
          📍 Use Current Location
        </Button>
        
        <Button className="w-full">
          Submit Report
        </Button>
      </div>
    </div>
  )
}
