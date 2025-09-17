import Elysia from "elysia";

export const categoryRouter = new Elysia()
	.get("/", () => {
		return "Hello World";
	});