import { createFileRoute } from '@tanstack/react-router'
import { MapPage } from '@/modules/map/pages/map'
import { MobileNavigation } from '@/components/mobile-navigation'

export const Route = createFileRoute('/map')({
  component: () => (
    <div className="pb-16">
      <MapPage />
      <MobileNavigation />
    </div>
  ),
})
