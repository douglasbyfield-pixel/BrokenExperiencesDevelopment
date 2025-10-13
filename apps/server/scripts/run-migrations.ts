import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env") });

async function runMigrations() {
	console.log("🔄 Starting database migrations...");
	console.log("📍 Database URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");

	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not set");
	}

	// Create postgres connection
	const connection = postgres(process.env.DATABASE_URL, {
		max: 1,
		ssl: process.env.DATABASE_URL.includes("supabase.com")
			? { rejectUnauthorized: false }
			: false,
	});

	const db = drizzle(connection);

	try {
		console.log("📂 Running migrations from:", resolve(__dirname, "../src/db/migrations"));
		
		await migrate(db, {
			migrationsFolder: resolve(__dirname, "../src/db/migrations"),
		});

		console.log("✅ Migrations completed successfully!");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		throw error;
	} finally {
		await connection.end();
	}
}

runMigrations();

