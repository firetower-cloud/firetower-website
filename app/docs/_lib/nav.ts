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
   * "Control plane" appears twice — as the heading over the install
   * walkthroughs, and as the Upgrade page beside "Worker" — and the section
   * above each says which. A page title has no section beside it: it is a
   * browser tab, a breadcrumb and a search result, so that one stays "Upgrade
   * the app".
   */
  navTitle?: string;
  /**
   * A heading above this page in the sidebar, shared with the pages beside it.
   *
   * The section is the top level and stays flat; this is the one level under
   * it, for a set of pages that are one subject split up — choosing an install,
   * and the two walkthroughs it sends you to. Consecutive entries with the same
   * group are drawn under one heading, so order in this list is what groups
   * them.
   */
  group?: string;
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
    title: "Overview",
    description:
      "Three setups — on your computer, on a server over SSH, or on a server with a custom domain — with a drawing of each, and what the control plane and the worker each do.",
    section: "Install",
    group: "Control plane",
  },
  {
    slug: "self-hosting/app/install/localhost",
    title: "Install on your computer",
    navTitle: "On your computer",
    description:
      "Install the app on the machine in front of you: every question firetower install asks, what it writes, and what it leaves on loopback.",
    section: "Install",
    group: "Control plane",
  },
  {
    slug: "self-hosting/app/install/serve-through-ssh",
    title: "Install on your server, through SSH",
    navTitle: "On your server, over SSH",
    description:
      "The same loopback install, on a machine that stays awake, reached from your laptop with firetower tunnel. Which port to pick, and what the tunnel does and does not carry.",
    section: "Install",
    group: "Control plane",
  },
  {
    slug: "self-hosting/app/install/server-with-custom-domain",
    title: "Install on your server, with a custom domain",
    navTitle: "Custom domain + Tailscale",
    description:
      "A real name and a real certificate over Tailscale, with nothing reachable from the internet: how DNS-01 does that, the two DNS records, the certificate wait, and every failure it can hit.",
    section: "Install",
    group: "Control plane",
  },
  {
    slug: "self-hosting/machines/install",
    title: "Add a machine",
    description:
      "Run sessions on a server you already own: install the worker with the CLI, then add the host over SSH.",
    section: "Install",
  },
  {
    slug: "self-hosting/domain/providers",
    title: "DNS providers",
    description:
      "Every DNS provider Firetower can obtain a certificate through: which credential each one needs, which take a single token, and which need a block written into the Caddyfile.",
    section: "Install",
  },
  {
    slug: "self-hosting/app/upgrade",
    title: "Upgrade the app",
    navTitle: "Control plane",
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
