export const runtime = "nodejs";

import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
	try {
		// Read the service worker file from the public directory
		const swPath = join(process.cwd(), "public", "sw.js");
		const swContent = readFileSync(swPath, "utf8");

		return new Response(swContent, {
			headers: {
				"Content-Type": "application/javascript",
				"Cache-Control": "public, max-age=0", // Don't cache service worker
				"Service-Worker-Allowed": "/", // Allow service worker for entire domain
			},
		});
	} catch (error) {
		console.error("Error serving service worker:", error);
		return new Response("Service worker not found", { status: 404 });
	}
}