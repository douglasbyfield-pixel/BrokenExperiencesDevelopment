import Elysia from "elysia";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";
import { miscRouter } from "./misc/router";
import { userRouter } from "./user/router";
import { issueRouter } from "./issue/router";

export const appRouter = new Elysia()
	.use(categoryRouter)
	.use(experienceRouter)
	.use(miscRouter)
	.use(userRouter)
	.use(issueRouter);