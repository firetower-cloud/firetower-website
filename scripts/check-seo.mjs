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
for (const f of [
  "index.html",
  "enterprise.html",
  "enterprise.md",
  "enterprise/opengraph-image",
  "enterprise/twitter-image",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "llms-full.txt",
  "opengraph-image",
  "apple-icon",
]) {
  if (!existsSync(`${OUT}/${f}`)) fail(f, "missing from the export");
}
if (problems.length) done();

/* ── Sitemap ↔ export ↔ manifest ──────────────────────────────────────── */
const sitemap = read("sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

if (!locs.length) fail("sitemap.xml", "lists no URLs at all");
if (new Set(locs).size !== locs.length) fail("sitemap.xml", "duplicate URLs");

for (const loc of locs) {
  if (new URL(loc).origin !== HOST) fail("sitemap.xml", `${loc} is not on ${HOST}`);
  const path = loc.slice(HOST.length);
  // cleanUrls: /docs is served from docs.html, / from index.html.
  const file = `${OUT}${path || "/index"}.html`;
  if (!existsSync(file))
    fail("sitemap.xml", `lists ${path || "/"} but ${file} is missing`);
}

// Every page in the docs navigation has to be advertised. This is the
// direction the old check did not cover: a page could be added to nav.ts,
// build fine, render fine, and never be offered to a crawler.
const manifest = JSON.parse(readFileSync("content/docs-manifest.json", "utf8"));
const slugs = manifest.map((d) => d.slug);
if (slugs.length < 5)
  fail(
    "nav.ts",
    `only found ${slugs.length} slugs — did the manifest's shape change?`,
  );
for (const slug of slugs) {
  const url = slug ? `${HOST}/docs/${slug}` : `${HOST}/docs`;
  if (!locs.includes(url))
    fail(
      "sitemap.xml",
      `nav.ts has "${slug}" but the sitemap does not list ${url}`,
    );
}

/* ── Per-page: the tags a search result is built from ─────────────────── */
const pages = globSync(`${OUT}/**/*.html`).filter(
  (p) => !/\/(404|_not-found)\.html$/.test(p),
);
if (!pages.length) fail(OUT, "no HTML pages found");

const titles = new Set();
const descriptions = new Set();
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const at = page.slice(OUT.length);
  const expected = HOST + (at === "/index.html" ? "/" : at.replace(/\.html$/, ""));
  if (/<meta name="(?:robots|googlebot)" content="[^"]*noindex/i.test(html)) fail(at, "page has noindex");
  if (!html.includes('rel="describedby" href="/llms.txt"')) fail(at, "missing agent index discovery link");
  if (!locs.some((loc) => new URL(loc).href === expected)) fail(at, "missing from sitemap");


  const canonicals = [
    ...html.matchAll(/<link rel="canonical" href="([^"]*)"/g),
  ];
  if (canonicals.length === 0) fail(at, "no <link rel=canonical>");
  // Two canonicals is worse than none — it is an explicit contradiction.
  else if (canonicals.length > 1)
    fail(at, `${canonicals.length} canonical links`);

  if (canonicals[0] && new URL(canonicals[0][1]).href !== expected) fail(at, "canonical points to a different page");

  const title = html.match(/<title>([^<]*)<\/title>/);
  if (!title?.[1]?.trim()) fail(at, "empty or missing <title>");

  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  if (!desc?.[1]?.trim()) fail(at, "empty or missing meta description");
  if (titles.has(title?.[1])) fail(at, "duplicate title");
  if (descriptions.has(desc?.[1])) fail(at, "duplicate description");
  titles.add(title?.[1]); descriptions.add(desc?.[1]);


  // Exactly one h1. Zero and a page has no stated subject; two and it has two.
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(at, `${h1s} <h1> elements, expected 1`);

  // JSON-LD that does not parse is silently ignored by every consumer, which
  // is exactly the failure that never announces itself.
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ];
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

/* Social cards must describe the page being shared, in both formats. */
const socialUrls = { og: new Set(), twitter: new Set() };
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const [kind, attribute, height] of [["og", "property", 630], ["twitter", "name", 600]]) {
    const matches = [...html.matchAll(new RegExp(`<meta ${attribute}="${kind}:image" content="([^"]+)"`, "g"))];
    if (matches.length !== 1) { fail(page, `${kind} must have exactly one share image`); continue; }
    const url = new URL(matches[0][1]);
    if (url.origin !== HOST) { fail(page, `${kind} image is not on the canonical host`); continue; }
    const image = `${OUT}${url.pathname}`;
    if (!existsSync(image)) { fail(page, `${kind} image is missing: ${url.pathname}`); continue; }
    const bytes = readFileSync(image);
    if (bytes.subarray(1, 4).toString() !== "PNG" || bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== height)
      fail(page, `${kind} image must be a 1200 × ${height} PNG`);
    if (bytes.length >= 5 * 1024 * 1024) fail(page, `${kind} image exceeds 5 MB`);
    if (socialUrls[kind].has(url.pathname)) fail(page, `${kind} reuses another page’s image`);
    socialUrls[kind].add(url.pathname);
    if (!html.includes(`${attribute}="${kind}:image:alt" content="`)) fail(page, `${kind} image has no alt text`);
  }
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
  const xTitle = html.match(/<meta name="twitter:title" content="([^"]+)"/)?.[1];
  if (ogTitle !== xTitle) fail(page, "OpenGraph and X titles describe different pages");
}
for (const asset of ["favicon.ico", "icon.svg", "icons/firetower-192.png", "icons/firetower-512.png"]) {
  if (!existsSync(`${OUT}/${asset}`)) fail(asset, "missing brand icon");
}

/* ── robots.txt ───────────────────────────────────────────────────────── */
const robots = read("robots.txt");
if (!robots.includes(`${HOST}/sitemap.xml`))
  fail("robots.txt", "does not point at the sitemap");
if (/^Disallow: \/$/m.test(robots))
  fail("robots.txt", "disallows the whole site");

/* The Enterprise page must stay independently shareable and discoverable. */
const enterprise = read("enterprise.html");
const enterpriseUrl = `${HOST}/enterprise`;
if (!locs.includes(enterpriseUrl)) fail("sitemap.xml", "missing Enterprise page");
if (!enterprise.includes(`<meta property="og:url" content="${enterpriseUrl}"`)) fail("enterprise", "wrong OpenGraph URL");
if (!enterprise.includes(`type="text/markdown" href="${HOST}/enterprise.md"`)) fail("enterprise", "missing Markdown alternate");
if (!read("llms.txt").includes(`${HOST}/enterprise.md`)) fail("llms.txt", "missing Enterprise offer");
if (!read("enterprise.md").startsWith("# Firetower Enterprise\n")) fail("enterprise.md", "missing title");
const enterpriseGraphs = [...enterprise.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap(([, raw]) => {
  const data = JSON.parse(raw); return data["@graph"] ?? [data];
});
const service = enterpriseGraphs.find((n) => n["@type"] === "Service");
if (!service || service.url !== enterpriseUrl || service.provider?.["@id"] !== `${HOST}/#organization`) fail("enterprise", "missing service/provider relationship");
if (service && "offers" in service) fail("enterprise", "service pricing must not be fabricated");
const home = read("index.html");
if (!home.includes('class="enterprise-services-callout shell"') || !home.includes('href="/enterprise"')) fail("home", "missing Enterprise integration");

/* Agent-facing content must stay complete and usable after docs edits. */
const index = read("llms.txt");
const full = read("llms-full.txt");
if (!index.startsWith("# Firetower\n")) fail("llms.txt", "missing project heading");
for (const doc of manifest) {
  const file = `docs/${doc.slug || "index"}.md`;
  if (!index.includes(`${HOST}/${file}`)) fail("llms.txt", `missing ${file}`);
  if (!existsSync(`${OUT}/${file}`)) { fail(file, "missing Markdown export"); continue; }
  const md = read(file);
  if (!md.startsWith(`# ${doc.title}\n`)) fail(file, "wrong title");
  if (!full.includes(md)) fail("llms-full.txt", `missing full contents of ${file}`);
  if (/<(?:button|script|style|img)[\s>]/i.test(md)) fail(file, "unconverted interface markup");
  const html = read(`docs${doc.slug ? "/" + doc.slug : ""}.html`);
  if (!html.includes(`type="text/markdown" href="${HOST}/${file}"`)) fail(file, "missing Markdown alternate link");
  for (const [, target] of md.matchAll(/\]\((https:\/\/usefiretower\.com[^)]+)\)/g)) {
    const url = new URL(target);
    if (![`${OUT}${url.pathname}`, `${OUT}${url.pathname}.html`].some(existsSync)) fail(file, `broken Markdown link ${target}`);
  }
}
const installMarkdown = read("docs/install-firetower.md");
if (!installMarkdown.includes("curl -fsSL https://usefiretower.com/install.sh | sh")) fail("Markdown", "installer command lost in conversion");
if (!read("docs/requirements.md").includes("|")) fail("Markdown", "requirements table lost in conversion");

done();

function done() {
  if (problems.length) {
    console.error(`\nSEO check failed — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error(`  ✗ ${p}`);
    console.error("");
    process.exit(1);
  }
  console.log(
    `SEO check passed — ${pages?.length ?? 0} pages, ${locs?.length ?? 0} sitemap URLs.`,
  );
}
