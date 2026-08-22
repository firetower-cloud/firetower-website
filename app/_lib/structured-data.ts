/**
 * schema.org / JSON-LD for the site.
 *
 * Three nodes with stable @ids so they can reference each other and be
 * extended later without renumbering: the organisation that makes it, the
 * website itself, and the software.
 *
 * Deliberately absent: aggregateRating. We have no verifiable reviews, and
 * inventing them is both a policy violation and the kind of thing that gets
 * rich results turned off for a whole domain.
 */
import { AUTHOR, LICENSE, NAME, REPO_URL, SITE_URL, SUMMARY, TAGLINE } from "./site";
import { LIFECYCLE, LIFECYCLE_PROMPT } from "./lifecycle";
import { findDoc, href, trail } from "../docs/_lib/nav";

export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;
const HOME_ID = `${SITE_URL}/#webpage`;
const HOWTO_ID = `${SITE_URL}/#lifecycle`;

/** Profiles that are about this project, and nothing else. A link to a
 *  directory's homepage is not a profile and weakens the signal. */
const SAME_AS = [REPO_URL];

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: AUTHOR,
    url: SITE_URL,
    description: `${AUTHOR} makes Firetower, an open-source control plane for running coding agents on your own servers.`,
    sameAs: SAME_AS,
  };
}

export function webSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: NAME,
    url: SITE_URL,
    description: TAGLINE,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function softwareApplicationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: NAME,
    alternateName: "Firetower control plane",
    description: SUMMARY,
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Developer tooling",
    operatingSystem: "Linux, macOS, Docker",
    license: "https://spdx.org/licenses/AGPL-3.0-only.html",
    softwareLicense: LICENSE,
    isAccessibleForFree: true,
    codeRepository: REPO_URL,
    downloadUrl: REPO_URL,
    publisher: { "@id": ORG_ID },
    // Free software still needs an Offer node; without one, search engines
    // have no statement that the price is zero and will not say so.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Run coding agents on your own servers over SSH",
      "Inbox for sessions that are blocked on you",
      "Per-session git worktrees and repository mirrors",
      "Live agent terminal in the browser",
      "Encrypted credentials with envelope encryption",
      "Diff, push, and open a pull request",
    ],
  };
}

/**
 * The homepage as a page, rather than as the site.
 *
 * `WebSite` describes the whole domain and `SoftwareApplication` describes the
 * product; neither says "this document, at this URL, is about that product",
 * which is the statement a search engine needs to connect a result to the
 * graph. The docs already have this via `docLd` — the homepage was the one
 * route without it.
 *
 * The breadcrumb has a single item on purpose. A one-item trail is valid, and
 * it makes the root of the hierarchy explicit rather than implied.
 */
export function webPageLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": HOME_ID,
        url: SITE_URL,
        name: `${NAME} — ${TAGLINE}`,
        description: SUMMARY,
        inLanguage: "en",
        isPartOf: { "@id": SITE_ID },
        about: { "@id": APP_ID },
        primaryImageOfPage: { "@id": `${SITE_URL}/opengraph-image` },
        breadcrumb: { "@id": `${SITE_URL}/#home-breadcrumbs` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#home-breadcrumbs`,
        itemListElement: [{ "@type": "ListItem", position: 1, name: NAME, item: SITE_URL }],
      },
    ],
  };
}

/**
 * The session lifecycle, as a HowTo.
 *
 * Built from the same `LIFECYCLE` array the homepage renders, so the schema
 * cannot describe a sequence the page does not show. This is the one piece of
 * genuinely procedural content on the site, and it is the part an answer
 * engine is most likely to be asked to reproduce — "what does Firetower
 * actually do when you give it a task".
 *
 * `k` and `v` are joined for `text` because apart they are a fragment and a
 * qualifier; together they are the sentence the page reads as.
 */
export function howToLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": HOWTO_ID,
    name: "What Firetower does with one sentence of work",
    description:
      "Give Firetower a sentence describing some work and it picks a host, cuts a branch, opens a worktree, starts tmux and runs your coding agent there — then keeps it running and tells you when it needs you.",
    inLanguage: "en",
    isPartOf: { "@id": HOME_ID },
    about: { "@id": APP_ID },
    // What you bring: a machine, and the sentence itself.
    supply: [
      { "@type": "HowToSupply", name: "A server you can reach over SSH" },
      { "@type": "HowToSupply", name: "A git repository" },
      { "@type": "HowToSupply", name: `A task, in a sentence — for example: ${LIFECYCLE_PROMPT}` },
    ],
    tool: [{ "@type": "HowToTool", name: NAME }],
    step: LIFECYCLE.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.k,
      text: `${NAME} ${s.k} ${s.v}.`,
      url: `${SITE_URL}/#how`,
    })),
  };
}

/**
 * A documentation page: what it is, and where it sits.
 *
 * `TechArticle` rather than `Article` — these are instructions for operating
 * software, and the distinction is the one search engines use to decide
 * whether a page belongs in a how-to result. The breadcrumb is what puts
 * "Docs › Install" under the link instead of a bare URL.
 */
export function docLd(slug: string) {
  const doc = findDoc(slug);
  const url = `${SITE_URL}${href(slug)}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: doc.title,
        description: doc.description,
        url,
        inLanguage: "en",
        isPartOf: { "@id": SITE_ID },
        about: { "@id": APP_ID },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: trail(slug).map((step, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: step.name,
          item: step.url,
        })),
      },
    ],
  };
}
