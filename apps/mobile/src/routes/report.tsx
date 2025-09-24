import { createFileRoute } from '@tanstack/react-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonCard, IonCardContent } from '@ionic/react'
import { useState } from 'react'

export const Route = createFileRoute('/report')({
  component: ReportPage,
})

function ReportPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('medium')

  const handleSubmit = () => {
    // TODO: Implement report submission logic
    console.log('Report:', { title, description, category, priority })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Report Issue</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent className="p-6">
            <div className="space-y-4">
              <IonItem>
                <IonLabel position="stacked">Title *</IonLabel>
                <IonInput
                  value={title}
                  onIonInput={(e) => setTitle(e.detail.value!)}
                  placeholder="Brief description of the issue"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Description *</IonLabel>
                <IonTextarea
                  value={description}
                  onIonInput={(e) => setDescription(e.detail.value!)}
                  placeholder="Detailed description of the issue"
                  rows={4}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Category</IonLabel>
                <IonSelect
                  value={category}
                  onSelectionChange={(e) => setCategory(e.detail.value)}
                  placeholder="Select a category"
                >
                  <IonSelectOption value="infrastructure">Infrastructure</IonSelectOption>
                  <IonSelectOption value="transportation">Transportation</IonSelectOption>
                  <IonSelectOption value="utilities">Utilities</IonSelectOption>
                  <IonSelectOption value="public-safety">Public Safety</IonSelectOption>
                  <IonSelectOption value="environment">Environment</IonSelectOption>
                  <IonSelectOption value="other">Other</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Priority</IonLabel>
                <IonSelect
                  value={priority}
                  onSelectionChange={(e) => setPriority(e.detail.value)}
                >
                  <IonSelectOption value="low">Low</IonSelectOption>
                  <IonSelectOption value="medium">Medium</IonSelectOption>
                  <IonSelectOption value="high">High</IonSelectOption>
                  <IonSelectOption value="critical">Critical</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonButton 
                expand="block" 
                onClick={handleSubmit}
                className="mt-6"
                disabled={!title || !description}
              >
                Submit Report
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  )
}
