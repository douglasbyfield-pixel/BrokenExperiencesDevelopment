import { db } from "@server/db";

async function resetDatabase() {
	await db.execute("DROP SCHEMA public CASCADE;");
	await db.execute("CREATE SCHEMA public;");
	const { spawnSync } = require("node:child_process");
	const result = spawnSync("bun", ["run", "db:push"], { stdio: "inherit" });
	if (result.status !== 0) {
		throw new Error(`bun run db:push failed with exit code ${result.status}`);
	}

	console.log("Dropped and recreated public schema. All tables removed.");
}

resetDatabase()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("Error resetting database:", err);
		process.exit(1);
	});
