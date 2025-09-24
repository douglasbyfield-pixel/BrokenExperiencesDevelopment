import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <div className="min-h-screen p-4 space-y-6 bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Broken Experiences</h1>
        <p className="text-muted-foreground">Report and discover broken experiences</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button className="h-20 flex flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
          <span className="text-lg">📍</span>
          <span>Map</span>
        </Button>
        <Button className="h-20 flex flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
          <span className="text-lg">📝</span>
          <span>Report</span>
        </Button>
        <Button className="h-20 flex flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
          <span className="text-lg">👤</span>
          <span>Profile</span>
        </Button>
        <Button className="h-20 flex flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
          <span className="text-lg">⚙️</span>
          <span>Settings</span>
        </Button>
      </div>
    </div>
  )
}
