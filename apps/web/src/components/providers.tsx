"use client";

import { SettingsProvider } from "@web/context/SettingsContext";
import { AuthProvider } from "./auth-provider";
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
			<AuthProvider>
				<SettingsProvider>
					{children}
					<Toaster richColors />
					<SettingsNotifications />
				</SettingsProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
