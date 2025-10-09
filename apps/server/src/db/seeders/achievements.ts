import { db } from "@server/db";
import { achievements } from "@server/db/schema";

export const achievementData = [
	// Fixer Badges
	{
		id: "quick_fix",
		name: "Quick Fix",
		description: "Awarded for fixing your first broken issue.",
		icon: "",
		category: "fixer",
		points: 50,
		requirement: 1,
		requirementType: "fixes_count",
		rarity: "common" as const,
	},
	{
		id: "patch_master",
		name: "Patch Master",
		description: "Recognized for consistently fixing multiple issues.",
		icon: "",
		category: "fixer",
		points: 100,
		requirement: 5,
		requirementType: "fixes_count",
		rarity: "common" as const,
	},
	{
		id: "restoration_pro",
		name: "Restoration Pro",
		description: "Given for fixing a substantial number of issues.",
		icon: "",
		category: "fixer",
		points: 200,
		requirement: 10,
		requirementType: "fixes_count",
		rarity: "rare" as const,
	},
	{
		id: "rebuilder",
		name: "Rebuilder",
		description:
			"Earned for fixing a high volume of issues, proving strong commitment.",
		icon: "",
		category: "fixer",
		points: 500,
		requirement: 25,
		requirementType: "fixes_count",
		rarity: "epic" as const,
	},
	{
		id: "city_saver",
		name: "City Saver",
		description:
			"Ultimate badge for fixing a landmark number of issues in the app.",
		icon: "",
		category: "fixer",
		points: 1000,
		requirement: 50,
		requirementType: "fixes_count",
		rarity: "legendary" as const,
	},

	// Reporter Badges
	{
		id: "trail_finder",
		name: "Trail Finder",
		description: "Awarded for submitting your first broken issue.",
		icon: "",
		category: "reporter",
		points: 25,
		requirement: 1,
		requirementType: "reports_count",
		rarity: "common" as const,
	},
	{
		id: "scout",
		name: "Scout",
		description: "Recognized for reporting several issues across locations.",
		icon: "",
		category: "reporter",
		points: 50,
		requirement: 5,
		requirementType: "reports_count",
		rarity: "common" as const,
	},
	{
		id: "pathfinder",
		name: "Pathfinder",
		description: "Given for verifying and reporting multiple community issues.",
		icon: "",
		category: "reporter",
		points: 100,
		requirement: 10,
		requirementType: "reports_count",
		rarity: "rare" as const,
	},
	{
		id: "seeker",
		name: "Seeker",
		description: "Awarded for being a top finder and verifier of issues.",
		icon: "",
		category: "reporter",
		points: 250,
		requirement: 25,
		requirementType: "reports_count",
		rarity: "epic" as const,
	},
	{
		id: "urban_detective",
		name: "Urban Detective",
		description:
			"Elite badge for reporting and verifying a landmark number of issues.",
		icon: "",
		category: "reporter",
		points: 500,
		requirement: 50,
		requirementType: "reports_count",
		rarity: "legendary" as const,
	},

	// Sponsor Badges
	{
		id: "supporter",
		name: "Supporter",
		description: "Awarded for sponsoring your first issue fix.",
		icon: "",
		category: "sponsor",
		points: 100,
		requirement: 1,
		requirementType: "sponsorships_count",
		rarity: "common" as const,
	},
	{
		id: "backer",
		name: "Backer",
		description: "Recognized for consistent contributions toward issue fixes.",
		icon: "",
		category: "sponsor",
		points: 200,
		requirement: 3,
		requirementType: "sponsorships_count",
		rarity: "common" as const,
	},
	{
		id: "patron",
		name: "Patron",
		description: "Given for providing multiple sponsorships across issues.",
		icon: "",
		category: "sponsor",
		points: 400,
		requirement: 5,
		requirementType: "sponsorships_count",
		rarity: "rare" as const,
	},
	{
		id: "investor",
		name: "Investor",
		description:
			"Awarded for being a leading contributor to issue sponsorship.",
		icon: "",
		category: "sponsor",
		points: 800,
		requirement: 10,
		requirementType: "sponsorships_count",
		rarity: "epic" as const,
	},
	{
		id: "champion_sponsor",
		name: "Champion Sponsor",
		description: "Top tier badge for high-level ongoing sponsorship support.",
		icon: "",
		category: "sponsor",
		points: 1500,
		requirement: 20,
		requirementType: "sponsorships_count",
		rarity: "legendary" as const,
	},

	// Community Badges
	{
		id: "cheerleader",
		name: "Cheerleader",
		description:
			"Awarded for liking or voting on your first broken experience.",
		icon: "",
		category: "community",
		points: 10,
		requirement: 1,
		requirementType: "community_actions",
		rarity: "common" as const,
	},
	{
		id: "advocate",
		name: "Advocate",
		description: "Recognized for bookmarking or engaging with multiple issues.",
		icon: "",
		category: "community",
		points: 25,
		requirement: 5,
		requirementType: "community_actions",
		rarity: "common" as const,
	},
	{
		id: "connector",
		name: "Connector",
		description: "Given for actively engaging in discussions/comments.",
		icon: "",
		category: "community",
		points: 50,
		requirement: 10,
		requirementType: "community_actions",
		rarity: "rare" as const,
	},
	{
		id: "influencer",
		name: "Influencer",
		description:
			"Earned for high engagement across multiple broken experiences.",
		icon: "",
		category: "community",
		points: 125,
		requirement: 25,
		requirementType: "community_actions",
		rarity: "epic" as const,
	},
	{
		id: "community_hero",
		name: "Community Hero",
		description:
			"Ultimate badge for consistently driving community participation.",
		icon: "",
		category: "community",
		points: 250,
		requirement: 50,
		requirementType: "community_actions",
		rarity: "legendary" as const,
	},
];

export async function seedAchievements() {
	console.log("🌱 Seeding achievements...");

	try {
		// Clear existing achievements
		await db.delete(achievements);

		// Insert all achievements
		await db.insert(achievements).values(achievementData);

		console.log(
			`✅ Successfully seeded ${achievementData.length} achievements`,
		);
	} catch (error) {
		console.error("❌ Error seeding achievements:", error);
		throw error;
	}
}
