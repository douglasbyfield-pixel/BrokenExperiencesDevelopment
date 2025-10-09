import { db } from "@server/db";
import { user } from "@server/db/schema";
import {
	dbToFrontendFormat,
	type FrontendSettings,
	frontendToDbFormat,
	type UserSettings,
	userSettings,
} from "@server/db/schema/user-settings";
import { eq } from "drizzle-orm";

export class SettingsService {
	/**
	 * Get user settings by user ID
	 */
	static async getUserSettings(userId: string): Promise<FrontendSettings> {
		try {
			const result = await db
				.select()
				.from(userSettings)
				.where(eq(userSettings.userId, userId))
				.limit(1);

			if (result.length === 0) {
				// Return default settings if none found
				return {
					notifications: {
						email: true,
						push: true,
						issueUpdates: true,
						weeklyReport: false,
					},
					privacy: {
						showProfile: true,
						showActivity: true,
						showStats: true,
					},
					display: {
						theme: "light",
						language: "en",
						mapStyle: "satellite-v9",
					},
					app: {
						pwaInstallPromptSeen: false,
					},
				};
			}

			return dbToFrontendFormat(result[0]);
		} catch (error) {
			console.error("Error fetching user settings:", error);
			throw new Error("Failed to fetch user settings");
		}
	}

	/**
	 * Update user settings
	 */
	static async updateUserSettings(
		userId: string,
		updates: Partial<FrontendSettings>,
	): Promise<FrontendSettings> {
		try {
			const dbUpdates = frontendToDbFormat(updates, userId);

			// Use upsert (insert or update)
			const result = await db
				.insert(userSettings)
				.values({
					userId,
					...dbUpdates,
				})
				.onConflictDoUpdate({
					target: userSettings.userId,
					set: {
						...dbUpdates,
						updatedAt: new Date(),
					},
				})
				.returning();

			return dbToFrontendFormat(result[0]);
		} catch (error) {
			console.error("Error updating user settings:", error);
			throw new Error("Failed to update user settings");
		}
	}

	/**
	 * Delete user settings (used when deleting account)
	 */
	static async deleteUserSettings(userId: string): Promise<void> {
		try {
			await db.delete(userSettings).where(eq(userSettings.userId, userId));
		} catch (error) {
			console.error("Error deleting user settings:", error);
			throw new Error("Failed to delete user settings");
		}
	}

	/**
	 * Delete user account completely (CASCADE deletes all related data)
	 */
	static async deleteUserAccount(userId: string): Promise<void> {
		try {
			// Delete the user from the database
			// This will CASCADE delete all related data:
			// - experiences (reportedBy)
			// - votes (userId)
			// - user_settings (userId)
			// - any other tables with CASCADE foreign keys
			await db.delete(user).where(eq(user.id, userId));
		} catch (error) {
			console.error("Error deleting user account:", error);
			throw new Error("Failed to delete user account");
		}
	}

	/**
	 * Create default settings for a new user
	 */
	static async createDefaultSettings(
		userId: string,
	): Promise<FrontendSettings> {
		try {
			const defaultSettings = {
				userId,
				emailNotifications: true,
				pushNotifications: true,
				issueUpdates: true,
				weeklyReport: false,
				showProfile: true,
				showActivity: true,
				showStats: true,
				theme: "light" as const,
				language: "en",
				mapStyle: "satellite-v9",
				pwaInstallPromptSeen: false, // Add PWA field
			};

			const result = await db
				.insert(userSettings)
				.values(defaultSettings)
				.returning();

			return dbToFrontendFormat(result[0]);
		} catch (error) {
			console.error("Error creating default settings:", error);
			throw new Error("Failed to create default settings");
		}
	}
}
