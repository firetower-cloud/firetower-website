import type { MetadataRoute } from "next";
import { NAME, TAGLINE } from "./_lib/site";

/**
 * `output: "export"` has no server to run this at request time, so Next
 * requires the route to declare itself static and be emitted as a file.
 */
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NAME,
    short_name: NAME,
    description: TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#F8F8F7",
    theme_color: "#F8F8F7",
    icons: [
      { src: "/icons/firetower-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/firetower-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
