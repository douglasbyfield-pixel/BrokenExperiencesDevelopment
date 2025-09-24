import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'

setupIonicReact()

export const Route = createRootRoute({
  component: () => (
    <IonApp>
      <IonRouterOutlet>
        <Outlet />
      </IonRouterOutlet>
      <TanStackRouterDevtools />
    </IonApp>
  ),
})
