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
    background_color: "#0a0908",
    theme_color: "#0a0908",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
