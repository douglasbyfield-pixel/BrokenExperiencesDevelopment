import Elysia from "elysia";
import { badgesRouter } from "./badges/router";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";
import { miscRouter } from "./misc/router";
import { reportRouter } from "./report/router";
import { scoringRouter } from "./scoring/router";
import { settingsRouter } from "./settings/router";
import { statsRouter } from "./stats/router";

export const appRouter = new Elysia()
	.use(categoryRouter)
	.use(experienceRouter)
	.use(reportRouter)
	.use(miscRouter)
	.use(statsRouter)
	.use(settingsRouter)
	.use(badgesRouter)
	.use(scoringRouter);
