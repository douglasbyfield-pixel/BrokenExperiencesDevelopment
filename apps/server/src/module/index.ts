import Elysia from "elysia";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";
import { reportRouter } from "./report/router";
import { miscRouter } from "./misc/router";

export const appRouter = new Elysia()
	.use(categoryRouter)
	.use(experienceRouter)
	.use(reportRouter)
	.use(miscRouter);