import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "broken-experiences",
		short_name: "broken-experiences",
		description: "my pwa app",
		start_url: "/home",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		icons: [
			{
				src: "/images/logo.png",
				sizes: "any",
				type: "image/png",
			},
		],
	};
}
