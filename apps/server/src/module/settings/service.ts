// Mock settings service for demo purposes

interface UserSettings {
	userId: string;
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

// Mock storage
const userSettings: Map<string, UserSettings> = new Map();

// Initialize default settings for demo user
userSettings.set("user-123", {
	userId: "user-123",
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
		theme: "system",
		language: "en",
		mapStyle: "streets-v12"
	}
});

export const settingsService = {
	async getUserSettings(userId: string): Promise<UserSettings> {
		// Get settings or return defaults
		const settings = userSettings.get(userId);
		
		if (!settings) {
			// Return default settings
			const defaultSettings: UserSettings = {
				userId,
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
					theme: "system",
					language: "en",
					mapStyle: "streets-v12"
				}
			};
			
			userSettings.set(userId, defaultSettings);
			return defaultSettings;
		}
		
		return settings;
	},
	
	async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
		const currentSettings = await this.getUserSettings(userId);
		
		// Deep merge the updates
		const updatedSettings: UserSettings = {
			...currentSettings,
			notifications: {
				...currentSettings.notifications,
				...(updates.notifications || {})
			},
			privacy: {
				...currentSettings.privacy,
				...(updates.privacy || {})
			},
			display: {
				...currentSettings.display,
				...(updates.display || {})
			}
		};
		
		userSettings.set(userId, updatedSettings);
		return updatedSettings;
	},
	
	async deleteAccount(userId: string, password: string) {
		// In production, verify password first
		// For demo, just check if it's the demo password
		if (password !== "demo1234") {
			throw new Error("Invalid password");
		}
		
		// Remove user settings
		userSettings.delete(userId);
		
		// In production, this would also:
		// - Delete user from database
		// - Delete all user's issues
		// - Delete all user's activity
		// - Invalidate all sessions
		
		return {
			message: "Account deleted successfully",
			deletedAt: new Date().toISOString()
		};
	}
};