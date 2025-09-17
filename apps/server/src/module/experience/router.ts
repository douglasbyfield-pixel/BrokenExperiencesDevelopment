import Elysia from "elysia";

export const experienceRouter = new Elysia()
	.get("/", () => {
		return "Hello World";
	});