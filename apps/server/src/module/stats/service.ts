import { db } from "@server/db";
import {
	category,
	ExperienceStatusEnum,
	experience,
	user,
} from "@server/db/schema";
import { and, count, desc, eq } from "drizzle-orm";

export const getStats = async () => {
	const [totalExperiences] = await db
		.select({ count: count() })
		.from(experience);
	const [resolvedExperiences] = await db
		.select({ count: count() })
		.from(experience)
		.where(eq(experience.status, ExperienceStatusEnum.resolved));
	const [activeUsers] = await db.select({ count: count() }).from(user);

	return {
		totalExperiences: totalExperiences.count,
		resolvedExperiences: resolvedExperiences.count,
		activeUsers: activeUsers.count,
	};
};

export const getUserStats = async (userId: string) => {
	const [userExperiences] = await db
		.select({ count: count() })
		.from(experience)
		.where(eq(experience.reportedBy, userId));
	const [userResolvedExperiences] = await db
		.select({ count: count() })
		.from(experience)
		.where(
			and(
				eq(experience.reportedBy, userId),
				eq(experience.status, ExperienceStatusEnum.resolved),
			),
		);
	const [userInProgressExperiences] = await db
		.select({ count: count() })
		.from(experience)
		.where(
			and(
				eq(experience.reportedBy, userId),
				eq(experience.status, ExperienceStatusEnum.in_progress),
			),
		);

	return {
		totalReports: userExperiences.count,
		resolvedReports: userResolvedExperiences.count,
		inProgressReports: userInProgressExperiences.count,
		impactScore:
			userExperiences.count * 10 + userResolvedExperiences.count * 25,
	};
};

export const getTrendingCategories = async () => {
	// Get more categories so frontend can cycle through them
	const trendingCategories = await db
		.select({
			id: category.id,
			name: category.name,
			count: count(),
		})
		.from(experience)
		.innerJoin(category, eq(experience.categoryId, category.id))
		.groupBy(category.id, category.name)
		.orderBy(desc(count()))
		.limit(20); // Increased limit for cycling

	return trendingCategories;
};
