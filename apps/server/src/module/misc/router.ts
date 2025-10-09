import Elysia from "elysia";

export const miscRouter = new Elysia({
	prefix: "/misc",
	tags: ["Misc"],
})
	.get("/", () => ({
		status: "ok",
		message: "Miscellaneous endpoints",
		endpoints: ["/health", "/version"],
	}))
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
