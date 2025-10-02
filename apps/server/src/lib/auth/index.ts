import { db } from "@server/db";
import * as schema from "@server/db/schema/auth";
import { env } from "@server/env";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { SettingsService } from "@server/module/settings/service";

const trustedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001,https://brokenexperiences.vercel.app")
	.split(",")
	.map(s => s.trim())
	.filter(Boolean);

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: trustedOrigins,
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Set to true in production
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID || "",
			clientSecret: env.GOOGLE_CLIENT_SECRET || "",
		},
	},
	advanced: {
		generateId: () => crypto.randomUUID(),
		cookiePrefix: "broken-exp",
		crossSubDomainCookies: {
			enabled: false,
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes
		},
	},
	hooks: {
		after: [
			{
				matcher: (ctx: any) => ctx.path === "/sign-up/email" || ctx.path?.includes("/callback"),
				handler: async (ctx: any) => {
					try {
						// Create default settings for new users
						if (ctx.user?.id) {
							console.log("🎯 Creating default settings for new user:", ctx.user.id);
							await SettingsService.createDefaultSettings(ctx.user.id);
							console.log("✅ Default settings created successfully");
						}
					} catch (error) {
						console.error("❌ Failed to create default settings:", error);
						// Don't fail the registration if settings creation fails
					}
				},
			},
			{
				matcher: (ctx: any) => ctx.path === "/sign-in/email" || ctx.path?.includes("/callback"),
				handler: async (ctx: any) => {
					try {
						// Ensure settings exist for existing users on sign-in
						if (ctx.user?.id) {
							console.log("🔍 Checking settings for user:", ctx.user.id);
							const settings = await SettingsService.getUserSettings(ctx.user.id);
							console.log("✅ User settings verified/created");
						}
					} catch (error) {
						console.error("❌ Failed to verify user settings:", error);
					}
				},
			},
		],
	},
});
