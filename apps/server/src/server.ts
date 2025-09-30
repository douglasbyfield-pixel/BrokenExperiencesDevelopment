import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { auth } from "./lib/auth";
import { appRouter } from "./module";
import logixlysia from "logixlysia";

export const app = new Elysia()
    .use(openapi())
    .use(logixlysia())
	.use(
		cors({
			origin: ["http://localhost:3001", "http://localhost:3000", "http://localhost:3002"],
			methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.mount(auth.handler)
	.use(appRouter)

export type App = typeof app;