import { boolean, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";

export const userSettings = pgTable("user_settings", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),

	// Notifications settings
	emailNotifications: boolean("email_notifications").default(true),
	pushNotifications: boolean("push_notifications").default(true),
	issueUpdates: boolean("issue_updates").default(true),
	weeklyReport: boolean("weekly_report").default(false),

	// Privacy settings
	showProfile: boolean("show_profile").default(true),
	showActivity: boolean("show_activity").default(true),
	showStats: boolean("show_stats").default(true),

	// Display settings
	theme: text("theme", { enum: ["light", "dark", "system"] }).default("light"),
	language: text("language").default("en"),
	mapStyle: text("map_style").default("satellite-v9"),

	// App experience settings
	pwaInstallPromptSeen: boolean("pwa_install_prompt_seen").default(false),

	// Proximity settings
	proximityNotifications: boolean("proximity_notifications").default(true),
	proximityRadius: numeric("proximity_radius", { precision: 10, scale: 2 }).default("5.0"),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSettingsSchema = createInsertSchema(userSettings);
export const selectUserSettingsSchema = createSelectSchema(userSettings);

// Frontend format schema to match what the frontend expects
export const frontendSettingsSchema = z.object({
	notifications: z.object({
		email: z.boolean(),
		push: z.boolean(),
		issueUpdates: z.boolean(),
		weeklyReport: z.boolean(),
		proximity: z.boolean().optional(),
	}),
	privacy: z.object({
		showProfile: z.boolean(),
		showActivity: z.boolean(),
		showStats: z.boolean(),
	}),
	display: z.object({
		theme: z.enum(["light", "dark", "system"]),
		language: z.string(),
		mapStyle: z.string(),
	}),
	app: z.object({
		pwaInstallPromptSeen: z.boolean(),
	}),
	proximity: z.object({
		enabled: z.boolean().optional(),
		radius: z.number().optional(),
	}).optional(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
export type FrontendSettings = z.infer<typeof frontendSettingsSchema>;

// Helper functions to transform between database and frontend formats
export function dbToFrontendFormat(dbSettings: UserSettings): FrontendSettings {
	return {
		notifications: {
			email: dbSettings.emailNotifications ?? true,
			push: dbSettings.pushNotifications ?? true,
			issueUpdates: dbSettings.issueUpdates ?? true,
			weeklyReport: dbSettings.weeklyReport ?? false,
			proximity: dbSettings.proximityNotifications ?? true,
		},
		privacy: {
			showProfile: dbSettings.showProfile ?? true,
			showActivity: dbSettings.showActivity ?? true,
			showStats: dbSettings.showStats ?? true,
		},
		display: {
			theme: dbSettings.theme ?? "light",
			language: dbSettings.language ?? "en",
			mapStyle: dbSettings.mapStyle ?? "satellite-v9",
		},
		app: {
			pwaInstallPromptSeen: dbSettings.pwaInstallPromptSeen ?? false,
		},
		proximity: {
			enabled: dbSettings.proximityNotifications ?? true,
			radius: dbSettings.proximityRadius ? parseFloat(dbSettings.proximityRadius) : 5.0,
		},
	};
}

export function frontendToDbFormat(
	frontendSettings: Partial<FrontendSettings>,
	userId: string,
): Partial<NewUserSettings> {
	const dbUpdates: Partial<NewUserSettings> = {
		userId,
		updatedAt: new Date(),
	};

	if (frontendSettings.notifications) {
		if (frontendSettings.notifications.email !== undefined) {
			dbUpdates.emailNotifications = frontendSettings.notifications.email;
		}
		if (frontendSettings.notifications.push !== undefined) {
			dbUpdates.pushNotifications = frontendSettings.notifications.push;
		}
		if (frontendSettings.notifications.issueUpdates !== undefined) {
			dbUpdates.issueUpdates = frontendSettings.notifications.issueUpdates;
		}
		if (frontendSettings.notifications.weeklyReport !== undefined) {
			dbUpdates.weeklyReport = frontendSettings.notifications.weeklyReport;
		}
		if (frontendSettings.notifications.proximity !== undefined) {
			dbUpdates.proximityNotifications = frontendSettings.notifications.proximity;
		}
	}

	if (frontendSettings.privacy) {
		if (frontendSettings.privacy.showProfile !== undefined) {
			dbUpdates.showProfile = frontendSettings.privacy.showProfile;
		}
		if (frontendSettings.privacy.showActivity !== undefined) {
			dbUpdates.showActivity = frontendSettings.privacy.showActivity;
		}
		if (frontendSettings.privacy.showStats !== undefined) {
			dbUpdates.showStats = frontendSettings.privacy.showStats;
		}
	}

	if (frontendSettings.display) {
		if (frontendSettings.display.theme !== undefined) {
			dbUpdates.theme = frontendSettings.display.theme;
		}
		if (frontendSettings.display.language !== undefined) {
			dbUpdates.language = frontendSettings.display.language;
		}
		if (frontendSettings.display.mapStyle !== undefined) {
			dbUpdates.mapStyle = frontendSettings.display.mapStyle;
		}
	}

	if (frontendSettings.app) {
		if (frontendSettings.app.pwaInstallPromptSeen !== undefined) {
			dbUpdates.pwaInstallPromptSeen =
				frontendSettings.app.pwaInstallPromptSeen;
		}
	}

	if (frontendSettings.proximity) {
		if (frontendSettings.proximity.enabled !== undefined) {
			dbUpdates.proximityNotifications = frontendSettings.proximity.enabled;
		}
		if (frontendSettings.proximity.radius !== undefined) {
			dbUpdates.proximityRadius = frontendSettings.proximity.radius.toString();
		}
	}

	return dbUpdates;
}
