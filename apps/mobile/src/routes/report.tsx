import { createFileRoute } from '@tanstack/react-router'
import { ReportPage } from '@/modules/reporting/pages/report'
import { MobileNavigation } from '@/components/mobile-navigation'

export const Route = createFileRoute('/report')({
  component: () => (
    <div className="pb-16">
      <ReportPage />
      <MobileNavigation />
    </div>
  ),
})
