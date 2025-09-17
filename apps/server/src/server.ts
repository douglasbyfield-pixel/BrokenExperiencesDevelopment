import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { appRouter } from "./module";

export const app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.mount(auth.handler)
	.use(appRouter)
	.listen(3000, () => console.log("Server is running on http://localhost:3000"));

export type AppRouter = typeof appRouter;