import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ORBIT - Your Personal Universe",
    short_name: "ORBIT",
    description:
      "Your personal universe for missions, learning, projects and creative goals.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#070812",
    theme_color: "#070812",
    orientation: "portrait-primary",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}