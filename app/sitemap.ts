import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";

/**
 * `output: "export"` has no server to run this at request time, so Next
 * requires the route to declare itself static and be emitted as a file.
 */
export const dynamic = "force-static";

/**
 * One page, one entry. `lastModified` is deliberately omitted: a build-time
 * stamp claims the page changed on every deploy, and search engines discount
 * a lastmod they catch being wrong. No date beats a guessed one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // No trailing slash, so this is byte-identical to the canonical link.
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
