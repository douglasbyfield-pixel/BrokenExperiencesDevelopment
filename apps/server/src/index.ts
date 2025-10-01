import { env } from "./env";
import { app } from "./server";

const signals = ["SIGINT", "SIGTERM"];

for (const signal of signals) {
	process.on(signal, async () => {
		console.log(`Received ${signal}. Initiating graceful shutdown...`);
		await app.stop();
		process.exit(0);
	});
}

process.on("uncaughtException", (error) => {
	console.error(error);
});

process.on("unhandledRejection", (error) => {
	console.error(error);
});

export const server = app.listen({
	port: env.PORT,
	hostname: "0.0.0.0", // Listen on all interfaces for Render
});

console.log(`🦊 Elysia is running at http://0.0.0.0:${env.PORT}`);
