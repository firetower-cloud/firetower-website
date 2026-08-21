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
export const TAGLINE = "Run any coding agent, on your own servers, from anywhere.";

export const SUMMARY =
  "Firetower is an open-source control plane for coding agents. Point it at a server you can SSH into, describe some work, and it cuts a branch, opens a worktree, starts tmux and keeps the agent running — attach from a browser or a phone, review the diff, ship the branch.";

/** Shorter, for cards and social where 160 characters is the budget. */
export const META_DESCRIPTION =
  "Open-source control plane for coding agents. Run them on your own servers, attach from a browser or a phone, review the diff and ship the branch. Self-hosted, no account.";

export const REPO_URL = "https://github.com/firetower-cloud/firetower";
export const REPO_RAW = "https://raw.githubusercontent.com/firetower-cloud/firetower/main";
export const LICENSE = "AGPL-3.0-only";
export const AUTHOR = "Westlabs LLC";

/** Anchors used by the in-page nav; also the sitemap's only real sections. */
