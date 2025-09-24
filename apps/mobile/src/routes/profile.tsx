import { createFileRoute } from '@tanstack/react-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonList } from '@ionic/react'
import { personOutline, settingsOutline, logOutOutline, documentTextOutline } from 'ionicons/icons'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout')
  }

  const handleSettings = () => {
    // TODO: Navigate to settings
    console.log('Settings')
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="space-y-6">
          {/* User Info Card */}
          <IonCard>
            <IonCardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <IonIcon 
                    icon={personOutline} 
                    className="text-2xl text-primary-600"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    John Doe
                  </h2>
                  <p className="text-gray-600">
                    john.doe@example.com
                  </p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Stats Card */}
          <IonCard>
            <IonCardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">12</div>
                  <div className="text-sm text-gray-600">Reports Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-600">Issues Resolved</div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Menu Items */}
          <IonList>
            <IonItem button onClick={handleSettings}>
              <IonIcon icon={settingsOutline} slot="start" />
              <IonLabel>Settings</IonLabel>
            </IonItem>
            
            <IonItem button>
              <IonIcon icon={documentTextOutline} slot="start" />
              <IonLabel>My Reports</IonLabel>
            </IonItem>
            
            <IonItem button onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" />
              <IonLabel>Logout</IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  )
}
