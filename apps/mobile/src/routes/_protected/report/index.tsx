import { createFileRoute } from '@tanstack/react-router'
import { ReportPage } from '@/modules/reporting/pages/report'

export const Route = createFileRoute('/_protected/report/')({
  component: () => <ReportPage />,
})
