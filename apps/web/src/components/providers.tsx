"use client";

import { SettingsProvider } from "@web/context/SettingsContext";
import { SettingsNotifications } from "./settings-notifications";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<SettingsProvider>
				{children}
				<Toaster richColors />
				<SettingsNotifications />
			</SettingsProvider>
		</ThemeProvider>
	);
}
