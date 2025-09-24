import { createFileRoute } from '@tanstack/react-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonButton } from '@ionic/react'
import { addOutline, locationOutline } from 'ionicons/icons'

export const Route = createFileRoute('/map')({
  component: MapPage,
})

function MapPage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Map</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="flex flex-col items-center justify-center min-h-full bg-gray-100">
          <div className="text-center p-8">
            <IonIcon 
              icon={locationOutline} 
              className="text-6xl text-gray-400 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Map View
            </h2>
            <p className="text-gray-500 mb-6">
              Interactive map showing reported issues will be displayed here.
            </p>
            <IonButton 
              routerLink="/report"
              className="w-full max-w-xs"
            >
              <IonIcon icon={addOutline} slot="start" />
              Report New Issue
            </IonButton>
          </div>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/report">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}
