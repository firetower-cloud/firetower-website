/**
 * One place for every fact the site repeats — the canonical origin, the
 * product's one-line description, the links in the nav and the footer.
 *
 * The origin in particular is load-bearing: it is the canonical URL, the
 * `metadataBase` for every relative OG image, the host in robots.txt, and
 * the prefix of every entry in the sitemap. Changing the domain should be
 * this line and nothing else.
 */
export const SITE_URL = "https://usefiretower.com";

export const NAME = "Firetower";

/** The README's opening line. It is the best sentence we have; reuse it. */
export const TAGLINE = "Run AI coding teams on your own infrastructure, 24/7.";

export const SUMMARY = "Firetower brings AI coding teams, shared skills and agent accounts together on your infrastructure. Built for enterprise. Unopinionated harness, model agnostic.";

/** Shorter, for cards and social where 160 characters is the budget. */
export const META_DESCRIPTION = "Run AI coding teams on your own infrastructure, 24/7. Share skills, manage access and keep work moving with your choice of agents and models.";

export const REPO_URL = "https://github.com/firetower-cloud/firetower";
export const DISCORD_URL = "https://discord.gg/Y2HYVEhSc";
export const ENTERPRISE_BOOKING_URL = "https://calendly.com/kevin-westlabs/firetower-enterprise";
export const REPO_RAW = "https://raw.githubusercontent.com/firetower-cloud/firetower/main";
export const LICENSE = "AGPL-3.0-only";
export const AUTHOR = "Westlabs LLC";

/**
 * The GA4 property. Public by design — it ships in the page source of every
 * static build, so there is nothing to hide in an environment variable and a
 * missing one would silently turn measurement off.
 *
 * This is mounted on every deploy, previews included, so PR channel traffic
 * lands in the same property as production. Filter it in GA4 by hostname if
 * it ever gets loud.
 */
export const GA_MEASUREMENT_ID = "G-4MV57HMRFX";
