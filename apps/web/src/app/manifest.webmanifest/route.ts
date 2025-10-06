import { MetadataRoute } from 'next';

export async function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "Broken Experiences",
    short_name: "BrokenExp",
    description: "Report and track broken digital experiences in your city",
    start_url: "/home",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ef4444",
    orientation: "portrait",
    scope: "/",
    categories: ["productivity", "utilities", "lifestyle"],
    icons: [
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return Response.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}