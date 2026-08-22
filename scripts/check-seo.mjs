/**
 * Assertions about the exported site that a build cannot make for you.
 *
 * `next build` is happy to emit a page with no canonical, a sitemap that has
 * drifted from the docs manifest, or JSON-LD with a trailing comma in it. None
 * of those fail anything — they fail quietly, weeks later, in Search Console.
 * This is the step that turns them back into build errors.
 *
 * Run it against a finished export:  npm run build && npm run check:seo
 */
import { readFileSync, existsSync } from "node:fs";
import { globSync } from "node:fs";

const OUT = "out";
const HOST = "https://usefiretower.com";
const GA_ID = "G-4MV57HMRFX";

const problems = [];
const fail = (where, what) => problems.push(`${where}: ${what}`);

const read = (p) => readFileSync(`${OUT}/${p}`, "utf8");

/* ── The files the site's own metadata promises exist ─────────────────── */
for (const f of ["index.html", "robots.txt", "sitemap.xml", "opengraph-image", "apple-icon"]) {
  if (!existsSync(`${OUT}/${f}`)) fail(f, "missing from the export");
}
if (problems.length) done();

/* ── Sitemap ↔ export ↔ manifest ──────────────────────────────────────── */
const sitemap = read("sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

if (!locs.length) fail("sitemap.xml", "lists no URLs at all");

for (const loc of locs) {
  if (!loc.startsWith(HOST)) fail("sitemap.xml", `${loc} is not on ${HOST}`);
  const path = loc.slice(HOST.length);
  // cleanUrls: /docs is served from docs.html, / from index.html.
  const file = `${OUT}${path || "/index"}.html`;
  if (!existsSync(file)) fail("sitemap.xml", `lists ${path || "/"} but ${file} is missing`);
}

// Every page in the docs navigation has to be advertised. This is the
// direction the old check did not cover: a page could be added to nav.ts,
// build fine, render fine, and never be offered to a crawler.
const nav = readFileSync("app/docs/_lib/nav.ts", "utf8");
const slugs = [...nav.matchAll(/^\s{4}slug: "([^"]*)",$/gm)].map((m) => m[1]);
if (slugs.length < 5) fail("nav.ts", `only found ${slugs.length} slugs — did the manifest's shape change?`);
for (const slug of slugs) {
  const url = slug ? `${HOST}/docs/${slug}` : `${HOST}/docs`;
  if (!locs.includes(url)) fail("sitemap.xml", `nav.ts has "${slug}" but the sitemap does not list ${url}`);
}

/* ── Per-page: the tags a search result is built from ─────────────────── */
const pages = globSync(`${OUT}/**/*.html`).filter((p) => !/\/(404|_not-found)\.html$/.test(p));
if (!pages.length) fail(OUT, "no HTML pages found");

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const at = page.slice(OUT.length);

  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)];
  if (canonicals.length === 0) fail(at, "no <link rel=canonical>");
  // Two canonicals is worse than none — it is an explicit contradiction.
  else if (canonicals.length > 1) fail(at, `${canonicals.length} canonical links`);

  const title = html.match(/<title>([^<]*)<\/title>/);
  if (!title?.[1]?.trim()) fail(at, "empty or missing <title>");

  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  if (!desc?.[1]?.trim()) fail(at, "empty or missing meta description");

  // Exactly one h1. Zero and a page has no stated subject; two and it has two.
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(at, `${h1s} <h1> elements, expected 1`);

  // JSON-LD that does not parse is silently ignored by every consumer, which
  // is exactly the failure that never announces itself.
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  if (!blocks.length) fail(at, "no JSON-LD");
  for (const [, body] of blocks) {
    try {
      const data = JSON.parse(body);
      const nodes = data["@graph"] ?? [data];
      for (const n of nodes) {
        if (!n["@type"]) fail(at, "a JSON-LD node has no @type");
      }
    } catch (e) {
      fail(at, `JSON-LD does not parse: ${e.message}`);
    }
  }

  if (!html.includes(GA_ID)) fail(at, `no Google Analytics tag (${GA_ID})`);
}

/* ── robots.txt ───────────────────────────────────────────────────────── */
const robots = read("robots.txt");
if (!robots.includes(`${HOST}/sitemap.xml`)) fail("robots.txt", "does not point at the sitemap");
if (/^Disallow: \/$/m.test(robots)) fail("robots.txt", "disallows the whole site");

done();

function done() {
  if (problems.length) {
    console.error(`\nSEO check failed — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error(`  ✗ ${p}`);
    console.error("");
    process.exit(1);
  }
  console.log(`SEO check passed — ${pages?.length ?? 0} pages, ${locs?.length ?? 0} sitemap URLs.`);
}
