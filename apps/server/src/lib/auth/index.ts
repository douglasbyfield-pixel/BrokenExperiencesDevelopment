import { db } from "@server/db";
import * as schema from "@server/db/schema/auth";
import { env } from "@server/env";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

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
	// hooks: {
	// 	after: [
	// 		{
	// 			matcher: (ctx: any) => ctx.path === "/sign-up/email" || ctx.path?.includes("/callback"),
	// 			handler: async (ctx: any) => {
	// 				// Sync new user to Supabase if needed
	// 				console.log("New user created via:", ctx.path);
	// 				// Add Supabase sync logic here if needed
	// 			},
	// 		},
	// 		{
	// 			matcher: (ctx: any) => ctx.path === "/sign-in/email" || ctx.path?.includes("/callback"),
	// 			handler: async (ctx: any) => {
	// 				console.log("User signed in via:", ctx.path);
	// 				// Add any post-signin logic here
	// 			},
	// 		},
	// 	],
	// },
});
