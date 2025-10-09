import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

config({ path: ".env" });

const client = postgres(env.DATABASE_URL, {
	prepare: false,
	ssl: env.DATABASE_URL.includes("supabase.com")
		? { rejectUnauthorized: false }
		: false,
});
export const db = drizzle(client, { schema });
