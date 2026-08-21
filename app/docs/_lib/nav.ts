import type { Metadata } from "next";
import { SITE_URL } from "../../_lib/site";

/* ── The one place the docs are described ────────────────────────────────
   This drives the sidebar, the previous/next links, the breadcrumbs, the
   per-page metadata, the JSON-LD and the sitemap. A page that is not here is
   not in the navigation, and a page that is here but has no file fails the
   build — which is the point. Adding a page is one entry and one file.
   ─────────────────────────────────────────────────────────────────────── */

export type Doc = {
  /** Path under /docs. Empty string is the index itself. */
  slug: string;
  title: string;
  /** Used as the meta description and the sidebar's hover text. */
  description: string;
  /** Sidebar grouping. */
  section: "Start" | "Run it" | "Reference";
};

export const DOCS: Doc[] = [
  {
    slug: "",
    title: "Documentation",
    description:
      "How to install Firetower, put it on a domain, add machines to run agents on, and look after its credentials.",
    section: "Start",
  },
  {
    slug: "install",
    title: "Install",
    description:
      "Run Firetower with Docker Compose: fetch the compose file, start it, and sign in with the administrator it makes on first start.",
    section: "Start",
  },
  {
    slug: "domain",
    title: "Put it on a domain",
    description:
      "Point a domain at the machine and Firetower serves HTTPS. What to set, which ports to open, and what each certificate failure means.",
    section: "Run it",
  },
  {
    slug: "hosts",
    title: "Add a machine",
    description:
      "Run sessions on a server you already own. Start the worker container, add the host over SSH, and drain it before you upgrade.",
    section: "Run it",
  },
  {
    slug: "repositories",
    title: "Connect repositories",
    description:
      "Paste a URL, or authorize GitHub with an OAuth app so you can pick from a list. Both, and why it is an OAuth app.",
    section: "Run it",
  },
  {
    slug: "operations",
    title: "Operations",
    description:
      "Upgrading, backups, running behind a proxy you already have, and who is allowed to use your Firetower.",
    section: "Reference",
  },
  {
    slug: "secrets",
    title: "Secrets",
    description:
      "Every credential Firetower holds is sealed with envelope encryption. Where the root key lives, and why it is backed up apart from the database.",
    section: "Reference",
  },
];

export const SECTION_ORDER: Doc["section"][] = ["Start", "Run it", "Reference"];

export const href = (slug: string) => (slug ? `/docs/${slug}` : "/docs");

export const findDoc = (slug: string) => {
  const doc = DOCS.find((d) => d.slug === slug);
  if (!doc) throw new Error(`No docs entry for "${slug}" — add one to nav.ts`);
  return doc;
};

/** Page metadata, from the manifest, so a title never drifts from the nav. */
export function docMeta(slug: string): Metadata {
  const doc = findDoc(slug);
  const path = href(slug);
  return {
    title: doc.slug ? doc.title : "Documentation",
    description: doc.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: `${SITE_URL}${path}`,
      title: `${doc.title} — Firetower docs`,
      description: doc.description,
    },
  };
}

/** What comes before and after this page, in reading order. */
export function neighbours(slug: string) {
  const i = DOCS.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? DOCS[i - 1] : null, next: i < DOCS.length - 1 ? DOCS[i + 1] : null };
}
