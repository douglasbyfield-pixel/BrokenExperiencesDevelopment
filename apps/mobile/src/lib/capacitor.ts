import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Keyboard, KeyboardResize, KeyboardStyle } from '@capacitor/keyboard'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Geolocation } from '@capacitor/geolocation'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export class CapacitorService {
  static isNative = Capacitor.isNativePlatform()

  static async initialize() {
    if (!this.isNative) return

    // Configure status bar
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#000000' })

    // Configure keyboard
    await Keyboard.setResizeMode({ mode: KeyboardResize.Ionic })
    await Keyboard.setStyle({ style: KeyboardStyle.Dark })

    // Hide splash screen
    await SplashScreen.hide()
  }

  static async hapticFeedback(style: ImpactStyle = ImpactStyle.Medium) {
    if (this.isNative) {
      await Haptics.impact({ style })
    }
  }

  static async getCurrentPosition() {
    if (!this.isNative) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          () => resolve(null)
        )
      })
    }

    try {
      const coordinates = await Geolocation.getCurrentPosition()
      return coordinates
    } catch (error) {
      console.error('Error getting location:', error)
      return null
    }
  }

  static async takePicture() {
    if (!this.isNative) {
      // Fallback for web
      return null
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      })
      return image
    } catch (error) {
      console.error('Error taking picture:', error)
      return null
    }
  }

  static async onAppStateChange(callback: (isActive: boolean) => void) {
    if (!this.isNative) return

    App.addListener('appStateChange', ({ isActive }) => {
      callback(isActive)
    })
  }

  static async onBackButton(callback: () => void) {
    if (!this.isNative) return

    App.addListener('backButton', callback)
  }
}
