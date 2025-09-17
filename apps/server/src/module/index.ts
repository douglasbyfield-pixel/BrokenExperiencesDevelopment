import Elysia from "elysia";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";

export const appRouter = new Elysia()
	.use(categoryRouter)
	.use(experienceRouter);