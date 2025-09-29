import { db } from "@server/db";
import { experience, ExperienceStatusEnum, user } from "@server/db/schema";
import { count, eq } from "drizzle-orm";

export const getStats = async () => {
	const [totalExperiences] = await db.select({ count: count() }).from(experience);
	const [resolvedExperiences] = await db.select({ count: count() }).from(experience).where(eq(experience.status, ExperienceStatusEnum.resolved));
	const [activeUsers] = await db.select({ count: count() }).from(user);
	
	return {
		totalExperiences : totalExperiences.count,
		resolvedExperiences : resolvedExperiences.count,
		activeUsers : activeUsers.count,
	};
};
