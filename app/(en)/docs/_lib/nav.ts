import type { Metadata } from "next";
import manifest from "../../../../content/docs-manifest.json";
import { SITE_URL } from "../../../_lib/site";
export type Doc = (typeof manifest)[number];
export const DOCS: Doc[] = manifest;
export const SECTION_ORDER = [...new Set(DOCS.map((d) => d.section))];
export const href = (slug: string) => (slug ? `/docs/${slug}` : "/docs");
export function findDoc(slug: string) {
  const doc = DOCS.find((d) => d.slug === slug);
  if (!doc) throw Error(`Unknown documentation page: ${slug}`);
  return doc;
}
export function docMeta(slug: string): Metadata {
  const doc = findDoc(slug);
  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: href(slug),
      types: { "text/markdown": `/docs/${slug || "index"}.md` },
    },
    openGraph: {
      type: "article",
      siteName: "Firetower",
      url: SITE_URL + href(slug),
      title: doc.title + " — Firetower docs",
      description: doc.description,
      images: [{ url: `/social/docs-${doc.id}-og.png`, width: 1200, height: 630, type: "image/png", alt: (slug ? `${doc.title} — Firetower documentation` : "Firetower documentation") }],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title + " — Firetower docs",
      description: doc.description,
      images: [{ url: `/social/docs-${doc.id}-x.png`, alt: (slug ? `${doc.title} — Firetower documentation` : "Firetower documentation") }],
    },
  };
}
export function neighbours(slug: string) {
  const i = DOCS.findIndex((d) => d.slug === slug);
  return { prev: DOCS[i - 1] ?? null, next: DOCS[i + 1] ?? null };
}
export function trail(slug: string) {
  return [
    { name: "Firetower", url: SITE_URL },
    { name: "Documentation", url: SITE_URL + "/docs" },
    ...(slug
      ? [{ name: findDoc(slug).title, url: SITE_URL + href(slug) }]
      : []),
  ];
}
