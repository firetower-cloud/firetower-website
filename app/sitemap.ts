import type { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";
import { DOCS, href } from "./(en)/docs/_lib/nav";

export const dynamic = "force-static";

/** Only published translations get alternates. English remains the default. */
export default function sitemap(): MetadataRoute.Sitemap {
  const marketing = [
    { en: SITE_URL, fr: `${SITE_URL}/fr`, priority: 1 },
    {
      en: `${SITE_URL}/enterprise`,
      fr: `${SITE_URL}/fr/enterprise`,
      priority: 0.9,
    },
  ].flatMap(({ en, fr, priority }) =>
    [en, fr].map((url) => ({
      url,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages: { en, fr, "x-default": en } },
    })),
  );
  return [
    ...marketing,
    ...DOCS.map((d) => ({
      url: `${SITE_URL}${href(d.slug)}`,
      changeFrequency: "monthly" as const,
      priority:
        d.slug === "" ? 0.9 : d.slug === "install-firetower" ? 0.8 : 0.7,
    })),
  ];
}
