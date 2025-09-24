import { createFileRoute } from '@tanstack/react-router'
import { MapPage } from '@/modules/map/pages/map'

export const Route = createFileRoute('/_protected/map/')({
  component: () => <MapPage />,
})