import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/modules/profile/pages/profile'
import { MobileNavigation } from '@/components/mobile-navigation'

export const Route = createFileRoute('/profile')({
  component: () => (
    <div className="pb-16">
      <ProfilePage />
      <MobileNavigation />
    </div>
  ),
})
