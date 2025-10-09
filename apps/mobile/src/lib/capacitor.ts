import { App } from "@capacitor/app";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Keyboard, KeyboardResize, KeyboardStyle } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export class CapacitorService {
	static isNative = Capacitor.isNativePlatform();

	static async initialize() {
		if (!CapacitorService.isNative) return;

		// Configure status bar
		await StatusBar.setStyle({ style: Style.Dark });
		await StatusBar.setBackgroundColor({ color: "#000000" });

		// Configure keyboard
		await Keyboard.setResizeMode({ mode: KeyboardResize.Ionic });
		await Keyboard.setStyle({ style: KeyboardStyle.Dark });

		// Hide splash screen
		await SplashScreen.hide();
	}

	static async hapticFeedback(style: ImpactStyle = ImpactStyle.Medium) {
		if (CapacitorService.isNative) {
			await Haptics.impact({ style });
		}
	}

	static async getCurrentPosition() {
		if (!CapacitorService.isNative) {
			return new Promise((resolve) => {
				navigator.geolocation.getCurrentPosition(
					(position) => resolve(position),
					() => resolve(null),
				);
			});
		}

		try {
			const coordinates = await Geolocation.getCurrentPosition();
			return coordinates;
		} catch (error) {
			console.error("Error getting location:", error);
			return null;
		}
	}

	static async takePicture() {
		if (!CapacitorService.isNative) {
			// Fallback for web
			return null;
		}

		try {
			const image = await Camera.getPhoto({
				quality: 90,
				allowEditing: true,
				resultType: CameraResultType.Uri,
				source: CameraSource.Camera,
			});
			return image;
		} catch (error) {
			console.error("Error taking picture:", error);
			return null;
		}
	}

	static async onAppStateChange(callback: (isActive: boolean) => void) {
		if (!CapacitorService.isNative) return;

		App.addListener("appStateChange", ({ isActive }) => {
			callback(isActive);
		});
	}

	static async onBackButton(callback: () => void) {
		if (!CapacitorService.isNative) return;

		App.addListener("backButton", callback);
	}
}
