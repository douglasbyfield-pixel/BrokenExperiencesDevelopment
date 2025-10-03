#!/usr/bin/env tsx

import { runAllSeeders } from "../src/db/seeders";

async function main() {
	try {
		await runAllSeeders();
		console.log("🎉 Database seeding completed successfully!");
	} catch (error) {
		console.error("💥 Database seeding failed:", error);
		process.exit(1);
	}
}

main();
