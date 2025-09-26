import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
	console.log("App component rendering...");

	// Temporarily disable custom fonts to get the app working
	console.log("Skipping font loading, rendering AppNavigator...");

	try {
		return (
			<SafeAreaProvider>
				<AppNavigator />
				<StatusBar style="auto" />
			</SafeAreaProvider>
		);
	} catch (error) {
		console.error("Error rendering AppNavigator:", error);
		return (
			<SafeAreaProvider>
				<SafeAreaView
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "red",
					}}
				>
					<Text style={{ fontSize: 18, color: "white" }}>
						Error: {String(error)}
					</Text>
				</SafeAreaView>
			</SafeAreaProvider>
		);
	}
}
