import { html } from "@elysiajs/html";
import Elysia from "elysia";

export const miscRouter = new Elysia({
	prefix: "/misc",
	tags: ["Misc"],
})
	.use(html())
	.get("/", ({ redirect }) => redirect("localhost:3000/openapi"))
	.get("/health", () => {
		return {
			status: "ok",
		};
	})
	.get("/version", () => {
		return {
			version: "1.0.0",
		};
	});
