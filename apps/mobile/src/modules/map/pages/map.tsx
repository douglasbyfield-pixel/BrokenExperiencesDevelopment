import { Button } from '@/components/ui/button'

export function MapPage() {
  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Map View</h1>
        <p className="text-muted-foreground">View broken experiences on the map</p>
      </div>
      
      <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
        <p className="text-muted-foreground">Map will be implemented here</p>
      </div>
      
      <div className="space-y-2">
        <Button className="w-full">
          📍 Use Current Location
        </Button>
        <Button variant="outline" className="w-full">
          🔍 Search Location
        </Button>
      </div>
    </div>
  )
}
