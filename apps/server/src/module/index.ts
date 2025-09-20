import Elysia from "elysia";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";
import { miscRouter } from "./misc/router";
import { userRouter } from "./user/router";
import { issueRouter } from "./issue/router";
import { authRouter } from "./auth/router";
import { settingsRouter } from "./settings/router";

export const appRouter = new Elysia()
	.use(authRouter)
	.use(categoryRouter)
	.use(experienceRouter)
	.use(miscRouter)
	.use(userRouter)
	.use(issueRouter)
	.use(settingsRouter);