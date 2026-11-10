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
import { AUTHOR, NAME, REPO_URL, SITE_URL, SUMMARY, TAGLINE } from "./site";
import { findDoc, href, trail } from "../docs/_lib/nav";

export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;
const HOME_ID = `${SITE_URL}/#webpage`;

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
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/firetower-512.png`, width: 512, height: 512 },
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
    operatingSystem: "macOS, Windows, iOS, Android; Linux server",
    license: "https://spdx.org/licenses/AGPL-3.0-only.html",
    isAccessibleForFree: true,
    sameAs: REPO_URL,
    installUrl: `${SITE_URL}/docs/join`,
    softwareHelp: { "@type": "CreativeWork", url: `${SITE_URL}/docs` },
    publisher: { "@id": ORG_ID },
    // This describes the open-source software, not hosting or agent-provider fees.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Run coding agents on your own servers over SSH",
      "Agent profiles, teams and shared skills",
      "Per-session git worktrees and repository mirrors",
      "Shared subscriptions with opt-in account fallback",
      "Encrypted credentials with envelope encryption",
      "Diff, push, and open a pull request",
    ],
  };
}

/** Product landing page. */
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
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 },
      },
    ],
  };
}

/** Documentation article and its position in the site. */
export function docLd(slug: string) {
  const doc = findDoc(slug);
  const url = `${SITE_URL}${href(slug)}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: doc.title,
        isPartOf: { "@id": SITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumbs` },
        mainEntity: { "@id": `${url}#article` },
      },
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: doc.title,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        image: `${SITE_URL}/social/docs-${doc.id}-og.png`,
        author: { "@id": ORG_ID },
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
