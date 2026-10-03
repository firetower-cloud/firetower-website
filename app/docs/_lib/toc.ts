import { readFileSync } from "node:fs";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import { DOCS } from "./nav";

/* ── The sections of every page, read off disk at build time ─────────────
   On the server, so the sidebar's sub-entries are in the HTML rather than
   appearing once JavaScript has run. An earlier version read them out of the
   rendered article in the browser, which worked and then did not: a table of
   contents that depends on hydration is one that is missing on the view that
   matters.

   `github-slugger` because it is the one `rehype-slug` uses, so these ids are
   the ids on the page rather than a second guess at the same algorithm.
   ─────────────────────────────────────────────────────────────────────── */

export type Heading = { id: string; title: string };

const FENCE = /^\s*(```|~~~)/;
const H2 = /^##[ \t]+(.+?)[ \t]*$/;

/** The inline markdown a heading is allowed to contain, removed. */
const plain = (s: string) =>
  s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`|\*/g, "")
    .trim();

function headingsIn(slug: string): Heading[] {
  const file = join(process.cwd(), "app", "docs", slug, "page.mdx");
  let source: string;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    throw new Error(`No page.mdx for the docs entry "${slug}" — check nav.ts`);
  }

  // One slugger per page, like rehype-slug's, so two headings with the same
  // words get the same -1 suffix here that they got there.
  const slugger = new GithubSlugger();
  const found: Heading[] = [];
  let fenced = false;

  for (const line of source.split("\n")) {
    if (FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = H2.exec(line);
    if (!match) continue;
    const title = plain(match[1]);
    found.push({ id: slugger.slug(title), title });
  }
  return found;
}

/**
 * Every page's sections, by slug.
 *
 * A function rather than a constant so that editing a heading shows up on the
 * next render in `next dev`, instead of waiting for the server to restart.
 */
export function toc(): Record<string, Heading[]> {
  return Object.fromEntries(DOCS.map((d) => [d.slug, headingsIn(d.slug)]));
}
