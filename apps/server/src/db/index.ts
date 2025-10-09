import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

config({ path: ".env" });

// Enhanced connection configuration for Supabase
const client = postgres(env.DATABASE_URL, {
	prepare: false,
	ssl: env.DATABASE_URL.includes("supabase.com")
		? { rejectUnauthorized: false }
		: false,
	max: 20, // Maximum connections in pool
	idle_timeout: 20, // Close idle connections after 20 seconds
	connect_timeout: 10, // Connection timeout in seconds
	max_lifetime: 60 * 30, // Close connections after 30 minutes
});

export const db = drizzle(client, { schema });

// Test connection on startup
client`SELECT 1 as test`.then(() => {
	console.log("✅ Database connected successfully");
}).catch((error) => {
	console.error("❌ Database connection failed:", error.message);
});
