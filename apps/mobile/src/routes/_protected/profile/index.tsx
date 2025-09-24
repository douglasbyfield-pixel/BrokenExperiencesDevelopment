import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/modules/profile/pages/profile'

export const Route = createFileRoute('/_protected/profile/')({
  component: () => <ProfilePage />,
})
