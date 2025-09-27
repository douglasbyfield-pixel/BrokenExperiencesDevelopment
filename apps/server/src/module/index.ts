import Elysia from "elysia";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";
import { miscRouter } from "./misc/router";
import { statsRouter } from "./stats/router";

export const appRouter = new Elysia()
	.use(categoryRouter)
	.use(experienceRouter)
	.use(miscRouter)
	.use(statsRouter);

