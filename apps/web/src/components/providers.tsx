"use client";

import { SettingsProvider } from "@web/context/SettingsContext";
import { AuthProvider } from "./auth-provider";
import { SettingsNotifications } from "./settings-notifications";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { OfflineNotification } from "./offline-notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Cache for 5 minutes
						staleTime: 5 * 60 * 1000,
						// Keep in cache for 10 minutes
						gcTime: 10 * 60 * 1000,
						// Retry failed requests 2 times
						retry: 2,
						// Refetch on window focus
						refetchOnWindowFocus: false,
						// Background refetch every 2 minutes
						refetchInterval: 2 * 60 * 1000,
					},
					mutations: {
						// Retry mutations once
						retry: 1,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
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
						<OfflineNotification />
						<ReactQueryDevtools initialIsOpen={false} />
					</SettingsProvider>
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
