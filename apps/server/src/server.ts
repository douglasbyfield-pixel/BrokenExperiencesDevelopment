import "dotenv/config";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { auth } from "./lib/auth";
import { appRouter } from "./module";

export const app = new Elysia()
	.use(openapi())
	.use(logixlysia())
	.use(
		cors({
			origin: ["http://localhost:3001", "http://localhost:3000"],
			methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.mount(auth.handler)
	.use(appRouter);