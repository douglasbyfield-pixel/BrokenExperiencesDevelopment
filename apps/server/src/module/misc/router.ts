import { html } from "@elysiajs/html";
import Elysia from "elysia";
import { MiscPage } from "./page";

export const miscRouter = new Elysia({
	prefix: "/misc",
	tags: ["Misc"],
})
	.use(html())
	.get("/", ({ html }) => html(MiscPage()))
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
