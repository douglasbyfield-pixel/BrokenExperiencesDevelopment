import Elysia from "elysia";
import { getStats } from "./service";

export const statsRouter = new Elysia({
	prefix: "/stats",
	tags: ["Stats"],
})
	.get("/", async () => {
		const result = await getStats();
		return result;
	},{
        detail: {
            summary: "Get stats",
            description: "Returns platform stats.",
        },
    })