"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/lib/i18n';

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
		showStats: boolean;
	};
	display: {
		theme: "light" | "dark" | "system";
		language: string;
		mapStyle: string;
	};
}

interface SettingsContextType {
	settings: UserSettings | null;
	updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
	applyTheme: (theme: "light" | "dark" | "system") => void;
	loading: boolean;
}

const defaultSettings: UserSettings = {
	notifications: {
		email: true,
		push: true,
		issueUpdates: true,
		weeklyReport: false
	},
	privacy: {
		showProfile: true,
		showActivity: true,
		showStats: true
	},
	display: {
		theme: "light",
		language: "en",
		mapStyle: "satellite-v9"
	}
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [loading, setLoading] = useState(true);

	// Load settings on mount
	useEffect(() => {
		loadSettings();
	}, []);

	// Apply theme and language when settings change
	useEffect(() => {
		if (settings?.display.theme) {
			applyTheme(settings.display.theme);
		}
		if (settings?.display.language) {
			i18n.changeLanguage(settings.display.language);
		}
	}, [settings?.display.theme, settings?.display.language]);

	const loadSettings = async () => {
		try {
			// Try to load from localStorage first
			const savedSettings = localStorage.getItem('userSettings');
			if (savedSettings) {
				const parsed = JSON.parse(savedSettings);
				setSettings(parsed);
				applyTheme(parsed.display.theme);
			} else {
				setSettings(defaultSettings);
				applyTheme(defaultSettings.display.theme);
			}

			// Try to fetch from API
			const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/settings`);
			if (response.ok) {
				const data = await response.json();
				setSettings(data);
				localStorage.setItem('userSettings', JSON.stringify(data));
				applyTheme(data.display.theme);
			}
		} catch (error) {
			console.error("Failed to fetch settings:", error);
			// Use default settings if everything fails
			if (!settings) {
				setSettings(defaultSettings);
				applyTheme(defaultSettings.display.theme);
			}
		} finally {
			setLoading(false);
		}
	};

	const updateSettings = async (newSettings: Partial<UserSettings>) => {
		if (!settings) return;

		// Deep merge the settings
		const updatedSettings: UserSettings = {
			notifications: {
				...settings.notifications,
				...(newSettings.notifications || {})
			},
			privacy: {
				...settings.privacy,
				...(newSettings.privacy || {})
			},
			display: {
				...settings.display,
				...(newSettings.display || {})
			}
		};

		// Update local state immediately
		setSettings(updatedSettings);
		
		// Save to localStorage
		localStorage.setItem('userSettings', JSON.stringify(updatedSettings));

		// Apply theme if it changed
		if (newSettings.display?.theme) {
			applyTheme(newSettings.display.theme);
		}

		// Apply language if it changed
		if (newSettings.display?.language) {
			i18n.changeLanguage(newSettings.display.language);
		}

		// Send to API
		try {
			await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/settings`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newSettings),
			});
		} catch (error) {
			console.error("Failed to save settings to API:", error);
		}
	};

	const applyTheme = (theme: "light" | "dark" | "system") => {
		const root = document.documentElement;
		
		if (theme === "system") {
			// Use system preference
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			root.classList.toggle('dark', systemTheme === 'dark');
		} else {
			// Use explicit theme
			root.classList.toggle('dark', theme === 'dark');
		}

		// Store the theme preference
		localStorage.setItem('theme', theme);
	};

	const value: SettingsContextType = {
		settings,
		updateSettings,
		applyTheme,
		loading
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
		throw new Error('useSettings must be used within a SettingsProvider');
	}
	return context;
}