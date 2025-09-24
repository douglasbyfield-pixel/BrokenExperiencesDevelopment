import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/modules/home/pages/home'
import { MobileNavigation } from '@/components/mobile-navigation'

export const Route = createFileRoute('/')({
  component: () => (
    <div className="pb-16">
      <HomePage />
      <MobileNavigation />
    </div>
  ),
})
