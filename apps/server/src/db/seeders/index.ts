import { seedAchievements } from "./achievements";

export async function runAllSeeders() {
	console.log("🚀 Starting database seeding...");

	try {
		await seedAchievements();

		console.log("✅ All seeders completed successfully!");
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		throw error;
	}
}

// Run seeders if this file is executed directly
if (require.main === module) {
	runAllSeeders()
		.then(() => {
			console.log("🎉 Seeding complete!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("💥 Seeding failed:", error);
			process.exit(1);
		});
}
