import { db } from "@server/db";
import { ExperienceStatusEnum } from "@server/db/schema";

export const getStats = async () => {
	const totalExperiences = await db.query.experience.findMany();
	const resolvedExperiences = await db.query.experience.findMany({
		where: (experience, { eq }) =>
			eq(experience.status, ExperienceStatusEnum.resolved),
	});
	const activeUsers = await db.query.user.findMany();

	return {
		totalExperiences,
		resolvedExperiences,
		activeUsers,
	};
};
