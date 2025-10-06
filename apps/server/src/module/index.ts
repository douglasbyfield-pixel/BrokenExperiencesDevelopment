import Elysia from "elysia";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";
import { reportRouter } from "./report/router";
import { miscRouter } from "./misc/router";
import { statsRouter } from "./stats/router";
import { settingsRouter } from "./settings/router";
import { badgesRouter } from "./badges/router";

export const appRouter = new Elysia()
	.use(categoryRouter)
	.use(experienceRouter)
	.use(reportRouter)
	.use(miscRouter)
	.use(statsRouter)
	.use(settingsRouter)
	.use(badgesRouter);
