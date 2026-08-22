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
   * Two pages are "Application" — one under Install, one under Upgrade — and
   * the section above them says which. A page title has no section beside it:
   * it is a browser tab, a breadcrumb and a search result, so those stay
   * "Install the app" and "Upgrade the app".
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
    title: "How it works",
    description:
      "The two things you run — the app, once, and a worker on every machine that should run agents — and the shapes that work.",
    section: "Start",
  },
  {
    slug: "self-hosting/app/install",
    title: "Install the app",
    navTitle: "Application",
    description:
      "Install the Firetower app with the CLI: what it asks, what it checks, and what it writes.",
    section: "Install",
  },
  {
    slug: "self-hosting/machines/install",
    title: "Add a machine",
    description:
      "Run sessions on a server you already own: install the worker with the CLI, then add the host over SSH.",
    section: "Install",
  },
  {
    slug: "self-hosting/domain",
    title: "Put it on a domain",
    description:
      "Point a domain at the machine and Firetower serves HTTPS. What to set, which ports to open, and what each certificate failure means.",
    section: "Install",
  },
  {
    slug: "self-hosting/app/upgrade",
    title: "Upgrade the app",
    navTitle: "Application",
    description:
      "firetower upgrade backs up the database, pulls the new release, and names every machine left running an older worker.",
    section: "Upgrade",
  },
  {
    slug: "self-hosting/machines/upgrade",
    title: "Upgrade the worker",
    navTitle: "Worker",
    description:
      "Drain the host, recreate the container, resume it — and what a worker that has drifted behind the app stops being able to do.",
    section: "Upgrade",
  },
  {
    slug: "self-hosting/operations",
    title: "Daily operations",
    description:
      "Backups, the commands you reach for, running behind a proxy you already have, and who is allowed to use your Firetower.",
    section: "Operations",
  },
  {
    slug: "repositories",
    title: "Connect repositories",
    description:
      "Paste a URL, or authorize GitHub with an OAuth app so you can pick from a list. Both, and why it is an OAuth app.",
    section: "Using Firetower",
  },
  {
    slug: "secrets",
    title: "Secrets",
    description:
      "Every credential Firetower holds is sealed with envelope encryption. Where the root key lives, and why it is backed up apart from the database.",
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
 * so `self-hosting/app/install` yields Home › Documentation › How it works ›
 * Install the app — and a segment that never gets its own page, like `app`,
 * simply does not appear rather than producing a crumb that 404s.
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
