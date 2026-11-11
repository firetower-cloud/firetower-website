import type { Metadata } from "next";
import manifest from "../../../../content/docs-manifest.json";
import frenchManifest from "../../../../content/docs-manifest.fr.json";
import { SITE_URL } from "../../../_lib/site";
import type { Locale } from "../../../_lib/i18n";
export type Doc = (typeof manifest)[number];
export const DOCS: Doc[] = manifest;
export const SECTION_ORDER = [...new Set(DOCS.map((d) => d.section))];
export const docsFor = (locale: Locale = "en"): Doc[] =>
  locale === "fr" ? frenchManifest : DOCS;
export const href = (slug: string, locale: Locale = "en") =>
  `${locale === "fr" ? "/fr" : ""}/docs${slug ? "/" + slug : ""}`;
export function findDoc(slug: string, locale: Locale = "en") {
  const doc = docsFor(locale).find((d) => d.slug === slug);
  if (!doc) throw Error(`Unknown documentation page: ${slug}`);
  return doc;
}
export function docMeta(slug: string, locale: Locale = "en"): Metadata {
  const doc = findDoc(slug, locale);
  const suffix =
    locale === "fr" ? " — Documentation Firetower" : " — Firetower docs";
  const image = `/social/${locale === "fr" ? "fr-" : ""}docs-${doc.id}`;
  const title = doc.title + suffix;
  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: href(slug, locale),
      languages: {
        en: href(slug),
        fr: href(slug, "fr"),
        "x-default": href(slug),
      },
      types: {
        "text/markdown": `${locale === "fr" ? "/fr" : ""}/docs/${slug || "index"}.md`,
      },
    },
    openGraph: {
      type: "article",
      siteName: "Firetower",
      url: SITE_URL + href(slug, locale),
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      title,
      description: doc.description,
      images: [
        {
          url: `${image}-og.png`,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: doc.description,
      images: [{ url: `${image}-x.png`, alt: title }],
    },
  };
}
export function neighbours(slug: string, locale: Locale = "en") {
  const docs = docsFor(locale);
  const i = docs.findIndex((d) => d.slug === slug);
  return { prev: docs[i - 1] ?? null, next: docs[i + 1] ?? null };
}
export function trail(slug: string, locale: Locale = "en") {
  return [
    { name: "Firetower", url: SITE_URL + (locale === "fr" ? "/fr" : "") },
    { name: "Documentation", url: SITE_URL + href("", locale) },
    ...(slug
      ? [
          {
            name: findDoc(slug, locale).title,
            url: SITE_URL + href(slug, locale),
          },
        ]
      : []),
  ];
}
