import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";

/**
 * `output: "export"` has no server to run this at request time, so Next
 * requires the route to declare itself static and be emitted as a file.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
