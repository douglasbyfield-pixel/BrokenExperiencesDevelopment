"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SettingsProvider } from "@web/context/SettingsContext";
import { useState } from "react";
import { AuthProvider } from "./auth-provider";
import { GeofencingProvider } from "./geofencing/geofencing-provider";
import { NotificationProvider } from "./notifications/notification-provider";
import { NotificationSystem } from "./notifications/notification-system";
import { OfflineQueueProvider } from "./offline-queue-provider";
import { OfflineStatus } from "./offline-status";
import { ThemeProvider } from "./theme-provider";

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
			}),
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
						<NotificationProvider>
							<GeofencingProvider>
								<OfflineQueueProvider>
									{children}
									<NotificationSystem />
									<OfflineStatus />
									<ReactQueryDevtools initialIsOpen={false} />
								</OfflineQueueProvider>
							</GeofencingProvider>
						</NotificationProvider>
					</SettingsProvider>
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
