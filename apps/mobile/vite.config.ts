import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), TanStackRouterVite()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/lib": path.resolve(__dirname, "./src/lib"),
			"@/modules": path.resolve(__dirname, "./src/modules"),
			"@/routes": path.resolve(__dirname, "./src/routes"),
			"@/config": path.resolve(__dirname, "./src/config"),
			"@/assets": path.resolve(__dirname, "./src/assets"),
		},
	},
	server: {
		port: 3002,
		host: true,
	},
	build: {
		outDir: "dist",
		sourcemap: true,
	},
});
