import "dotenv/config";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";
import { auth } from "./lib/auth";
import { appRouter } from "./module";

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001")
	.split(",")
	.map(s => s.trim())
	.filter(Boolean);

export const app = new Elysia()
	.use(openapi())
	.use(logixlysia())
	.use(
		cors({
			origin: corsOrigins,
			methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/api/auth/*", ({ request }) => auth.handler(request))
	.use(appRouter);

console.log("CORS allowlist:", corsOrigins);

export type App = typeof app;
