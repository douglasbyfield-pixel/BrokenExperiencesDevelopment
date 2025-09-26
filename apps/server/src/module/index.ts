import Elysia from "elysia";
import { authRouter } from "./auth/router";
import { categoryRouter } from "./category/router";
import { experienceRouter } from "./experience/router";
import { issueRouter } from "./issue/router";
import { miscRouter } from "./misc/router";
import { settingsRouter } from "./settings/router";
import { userRouter } from "./user/router";

export const appRouter = new Elysia()
	.use(authRouter)
	.use(categoryRouter)
	.use(experienceRouter)
	.use(miscRouter)
	.use(userRouter)
	.use(issueRouter)
	.use(settingsRouter);
