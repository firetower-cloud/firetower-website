import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";
import { DOCS, href } from "./docs/_lib/nav";

/**
 * Built from the docs manifest, so a page cannot exist in the navigation and
 * be missing here. `lastModified` is deliberately omitted: a build-time stamp
 * claims the page changed on every deploy, and search engines discount a
 * lastmod they catch being wrong. No date beats a guessed one.
 */
/** `output: "export"` has no server to run this at request time. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // No trailing slash, so this is byte-identical to the canonical link.
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...DOCS.map((d) => ({
      url: `${SITE_URL}${href(d.slug)}`,
      changeFrequency: "monthly" as const,
      // The index sits above the pages it links to, and the two install
      // pages above the rest — they are the ones somebody arrives needing.
      priority: d.slug === "" ? 0.9 : d.slug.endsWith("/install") ? 0.8 : 0.7,
    })),
  ];
}
