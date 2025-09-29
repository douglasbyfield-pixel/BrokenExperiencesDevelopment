import { db } from "@server/db";
import * as schema from "@server/db/schema/auth";
import { env } from "@server/env";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: ["http://localhost:3001"],
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		database: { generateId: false },
		cookiePrefix: "broken-exp",
	},
});
