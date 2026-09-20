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
  section: "Start" | "Install" | "Upgrade" | "Operations" | "Using Firetower";
  /**
   * What the sidebar calls it, when that differs from the title.
   *
   * Two pages are "The Firetower" — one under Install, one under Upgrade — and
   * the section above them says which. A page title has no section beside it:
   * it is a browser tab, a breadcrumb and a search result, so those stay
   * "Install the Firetower" and "Upgrade the Firetower".
   */
  navTitle?: string;
};

export const DOCS: Doc[] = [
  {
    slug: "",
    title: "Documentation",
    description:
      "How to run Firetower: pick between hosting it yourself and the cloud, install it, add machines for agents to run on, and look after its credentials.",
    section: "Start",
  },
  {
    slug: "getting-started",
    title: "Getting started",
    description:
      "Two ways to run Firetower — host it yourself today, or the cloud when it arrives. What each one asks of you.",
    section: "Start",
  },
  {
    slug: "self-hosting",
    title: "Key concepts",
    description:
      "The three parts of Firetower — the Firetower itself, a worker on every machine that should run agents, and the client you open — and how they fit together.",
    section: "Start",
  },
  {
    slug: "self-hosting/app/install",
    title: "Install the Firetower",
    navTitle: "The Firetower",
    description:
      "Install the Firetower — the control plane — with the CLI: what it asks, what it checks, and what it writes.",
    section: "Install",
  },
  {
    slug: "self-hosting/machines/install",
    title: "Add a machine",
    description:
      "Run sessions on a machine you already own: give it Firetower's key, add it over SSH, and Firetower installs the worker.",
    section: "Install",
  },
  {
    slug: "self-hosting/app/upgrade",
    title: "Upgrade the Firetower",
    navTitle: "The Firetower",
    description:
      "firetower upgrade backs up the database, pulls the new release, and names every machine left running an older worker.",
    section: "Upgrade",
  },
  {
    slug: "self-hosting/machines/upgrade",
    title: "Upgrade the worker",
    navTitle: "Worker",
    description:
      "Firetower reinstalls a worker over ssh from the Updates screen or the machine's panel — and what a worker that has drifted behind the app stops being able to do.",
    section: "Upgrade",
  },
  {
    slug: "connect-github",
    title: "Connect GitHub",
    description:
      "Register the OAuth application a Firetower authorises against, turn on its device flow, and connect your GitHub account — with the one checkbox everybody forgets.",
    section: "Using Firetower",
  },
];

export const SECTION_ORDER: Doc["section"][] = [
  "Start",
  "Install",
  "Upgrade",
  "Operations",
  "Using Firetower",
];

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

/**
 * The path to a page, as breadcrumbs.
 *
 * Walks the slug a segment at a time and keeps the ones that are real pages,
 * so `self-hosting/app/install` yields Home › Documentation › Key concepts ›
 * Install the Firetower — and a segment that never gets its own page, like
 * `app`, simply does not appear rather than producing a crumb that 404s.
 */
export function trail(slug: string) {
  const steps = [
    { name: "Firetower", url: SITE_URL },
    { name: "Documentation", url: `${SITE_URL}/docs` },
  ];

  const parts = slug ? slug.split("/") : [];
  for (let i = 0; i < parts.length; i++) {
    const at = parts.slice(0, i + 1).join("/");
    const doc = DOCS.find((d) => d.slug === at);
    if (doc) steps.push({ name: doc.title, url: `${SITE_URL}${href(at)}` });
  }
  return steps;
}
