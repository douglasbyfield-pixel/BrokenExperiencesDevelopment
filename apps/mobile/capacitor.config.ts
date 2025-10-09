import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
	appId: "com.brokenexperiences.mobile",
	appName: "Broken Experiences",
	webDir: "dist",
	server: {
		androidScheme: "https",
	},
	plugins: {
		SplashScreen: {
			launchShowDuration: 2000,
			backgroundColor: "#ffffff",
			showSpinner: false,
			androidSpinnerStyle: "large",
			iosSpinnerStyle: "small",
			spinnerColor: "#999999",
			splashFullScreen: true,
			splashImmersive: true,
		},
		StatusBar: {
			style: "dark",
			backgroundColor: "#000000",
		},
	},
};

export default config;
