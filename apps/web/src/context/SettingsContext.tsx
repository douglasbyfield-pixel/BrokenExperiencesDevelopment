"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useAuth } from "@web/components/auth-provider";
import { useTheme } from "next-themes";

interface UserSettings {
	notifications: {
		email: boolean;
		push: boolean;
		issueUpdates: boolean;
		weeklyReport: boolean;
	};
	privacy: {
		showProfile: boolean;
		showActivity: boolean;
	};
	display: {
		theme: "light" | "dark" | "system";
		mapStyle: string;
	};
	app: {
		pwaInstallPromptSeen: boolean;
	};
}

interface SettingsContextType {
	settings: UserSettings | null;
	updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
	loading: boolean;
}

const defaultSettings: UserSettings = {
	notifications: {
		email: true,
		push: true,
		issueUpdates: true,
		weeklyReport: true,
	},
	privacy: {
		showProfile: true,
		showActivity: true,
	},
	display: {
		theme: "light",
		mapStyle: "satellite-v9",
	},
	app: {
		pwaInstallPromptSeen: false,
	},
};

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const { user, session } = useAuth();
	const { setTheme } = useTheme();

	// Load settings when user changes
	useEffect(() => {
		if (user) {
			loadSettings();
		} else {
			// User logged out, clear settings
			setSettings(null);
			setLoading(false);
		}
	}, [user]);

	// Apply theme when settings change using next-themes
	useEffect(() => {
		if (settings?.display.theme) {
			setTheme(settings.display.theme);
		}
	}, [settings?.display.theme, setTheme]);

	const loadSettings = async () => {
		if (!user || !session) {
			setLoading(false);
			return;
		}

		try {
			// Check if we're in the browser
			if (typeof window !== "undefined") {
				// Try to load from localStorage first
				const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
				if (savedSettings) {
					const parsed = JSON.parse(savedSettings);
					setSettings(parsed);
					setTheme(parsed.display.theme);
				} else {
					setSettings(defaultSettings);
					setTheme(defaultSettings.display.theme);
				}

				// Try to fetch from API with authentication
				if (process.env.NEXT_PUBLIC_SERVER_URL) {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_SERVER_URL}/settings`,
						{
							headers: {
								'Authorization': `Bearer ${session.access_token}`,
								'Content-Type': 'application/json',
							},
						}
					);
					if (response.ok) {
						const data = await response.json();
						setSettings(data);
						localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(data));
						setTheme(data.display.theme);
					} else if (response.status === 404) {
						// No settings found, use defaults and create them
						setSettings(defaultSettings);
						setTheme(defaultSettings.display.theme);
						await updateSettings(defaultSettings);
					}
				}
			} else {
				// On server, just use default settings
				setSettings(defaultSettings);
			}
		} catch (error) {
			console.error("Failed to fetch settings:", error);
			// Use default settings if everything fails
			if (!settings) {
				setSettings(defaultSettings);
				// Only apply theme if we're in the browser
				if (typeof window !== "undefined") {
					setTheme(defaultSettings.display.theme);
				}
			}
		} finally {
			setLoading(false);
		}
	};

	const updateSettings = async (newSettings: Partial<UserSettings>) => {
		if (!settings || !user || !session) return;

		// Deep merge the settings
		const updatedSettings: UserSettings = {
			notifications: {
				...settings.notifications,
				...(newSettings.notifications || {}),
			},
			privacy: {
				...settings.privacy,
				...(newSettings.privacy || {}),
			},
			display: {
				...settings.display,
				...(newSettings.display || {}),
			},
			app: {
				...settings.app,
				...(newSettings.app || {}),
			},
		};

		// Update local state immediately
		setSettings(updatedSettings);

		// Save to localStorage (browser only)
		if (typeof window !== "undefined") {
			localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(updatedSettings));
		}

		// Apply theme if it changed using next-themes
		if (newSettings.display?.theme) {
			setTheme(newSettings.display.theme);
		}

		// Send to API with authentication (browser only)
		if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SERVER_URL) {
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/settings`, {
					method: "PATCH",
					headers: {
						'Authorization': `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(newSettings),
				});
				
				if (!response.ok) {
					console.error("Failed to save settings to API:", response.statusText);
				}
			} catch (error) {
				console.error("Failed to save settings to API:", error);
			}
		}
	};

	const value: SettingsContextType = {
		settings,
		updateSettings,
		loading,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
}
