import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ProfilePage() {
  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage src="" alt="Profile" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold mb-2">User Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Account Information</h3>
          <p className="text-sm text-muted-foreground">Email: user@example.com</p>
          <p className="text-sm text-muted-foreground">Reports: 5</p>
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            📝 My Reports
          </Button>
          <Button variant="outline" className="w-full justify-start">
            ⚙️ Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            ❓ Help & Support
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            🚪 Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
