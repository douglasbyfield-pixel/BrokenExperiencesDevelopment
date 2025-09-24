import { createFileRoute } from '@tanstack/react-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/react'
import { mapOutline, addOutline, personOutline } from 'ionicons/icons'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Broken Experiences</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="flex flex-col items-center justify-center min-h-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Report Broken Experiences
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Help improve your community by reporting issues and broken experiences around you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <IonButton 
              expand="block" 
              routerLink="/map"
              className="h-16 text-lg font-semibold"
            >
              <IonIcon icon={mapOutline} slot="start" />
              View Map
            </IonButton>
            
            <IonButton 
              expand="block" 
              fill="outline" 
              routerLink="/report"
              className="h-16 text-lg font-semibold"
            >
              <IonIcon icon={addOutline} slot="start" />
              Report Issue
            </IonButton>
            
            <IonButton 
              expand="block" 
              fill="clear" 
              routerLink="/profile"
              className="h-16 text-lg font-semibold"
            >
              <IonIcon icon={personOutline} slot="start" />
              Profile
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
