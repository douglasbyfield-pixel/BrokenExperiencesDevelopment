import { db } from "./index";
import { category } from "./schema";

const categories = [
	{ name: "Road & Infrastructure" },
	{ name: "Street Lighting" },
	{ name: "Sidewalks & Walkways" },
	{ name: "Parks & Recreation" },
	{ name: "Waste Management" },
	{ name: "Water & Drainage" },
	{ name: "Public Safety" },
	{ name: "Traffic & Parking" },
	{ name: "Graffiti & Vandalism" },
	{ name: "Noise & Disturbances" },
	{ name: "Building Maintenance" },
	{ name: "Public Transportation" },
	{ name: "Environmental Issues" },
	{ name: "Other" }
];

async function seedCategories() {
	try {
		console.log("🌱 Seeding categories...");
		
		// Check if categories already exist
		const existingCategories = await db.select().from(category);
		
		if (existingCategories.length > 0) {
			console.log("✅ Categories already exist, skipping seed");
			return;
		}
		
		// Insert categories
		const insertedCategories = await db.insert(category).values(categories).returning();
		
		console.log(`✅ Successfully seeded ${insertedCategories.length} categories`);
	} catch (error) {
		console.error("❌ Error seeding categories:", error);
		process.exit(1);
	}
}

// Run the seed function
seedCategories().then(() => {
	console.log("🎉 Category seeding complete");
	process.exit(0);
});