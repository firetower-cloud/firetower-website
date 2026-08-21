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

export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;

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
