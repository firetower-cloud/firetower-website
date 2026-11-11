# Firetower website

The public website and documentation, built with Next.js and exported as static files for Firebase Hosting. The approved identity uses DM Sans, the tower mark, and a light default with a persistent dark option.

## Development

Use Node.js 24, matching CI.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run check:seo
npm run check:content
npm run check:app-links
```

The production files are in `out/`. `npm start` is not a server for a static export; serve `out/` with clean URLs or use the Firebase Hosting emulator. The development server defaults to port 3000.

## Where to edit

| Path | Purpose |
| --- | --- |
| `app/_components/site/HomePage.tsx` | Shared homepage section order |
| `app/_components/site/` | Current homepage and documentation components |
| `app/globals.css` | Shared brand tokens, theme, typography and image viewer |
| `app/_components/site/home.css` | Scoped homepage styles |
| `app/(en)/docs/docs.css` | Scoped documentation styles |
| `content/docs/*.html` | Documentation article bodies, rendered into each page at build time |
| `content/docs-manifest.json` | Titles, descriptions, navigation, audiences and section anchors |
| `content/docs-review.json` | Internal source evidence and procedure validation still to perform |
| `public/product/` | Local WebP screenshots in light and dark variants |
| `app/_lib/site.ts` | Product copy, canonical origin and external links |
| `firebase.json` | Hosting, cache headers, installer links and legacy documentation redirects |

The previous ASCII website components remain in `app/_components/` for reference; the active homepage uses the shared components in `app/_components/site/`. Do not add new content to the old components.

## Documentation

Each manifest entry has one HTML body. The index uses `/docs`; other entries use `/docs/{slug}`. Next.js renders all documentation pages at build time with metadata, structured data, navigation and section links. Bodies are trusted repository content, never submitted user HTML.

Keep heading IDs and the manifest's `headings` entries in sync. `npm run build` and `npm run dev` regenerate the local search index and agent-readable Markdown. Search downloads that index only when opened. Product images can be enlarged, commands can be copied, and the sidebar adapts to smaller screens.

Legacy addresses redirect at the hosting layer. Next.js redirects cannot run on a static export. Keep `firebase.json` destinations aligned with the manifest. `check:content` checks exported links, assets, anchors and redirect targets; `check:seo` checks metadata, sitemap coverage and structured data.

Source review does not replace a clean installation test. Before publishing release-specific operational procedures, complete the relevant checks recorded in `content/docs-review.json`. The recovery page intentionally offers preparation and support guidance rather than unverified database import commands.

## SEO and agent-readable documentation

The export includes a canonical sitemap, robots.txt, unique page metadata and social cards, and Organization, WebSite, SoftwareApplication and documentation structured data. Stable image URLs revalidate after an hour; hashed Next.js assets remain immutable.

`/llms.txt` gives agents a concise product explanation and a grouped guide index. `/docs/{slug}.md` (or `/docs/index.md`) contains the same documentation as the HTML page, including commands, tables and screenshot links. `/llms-full.txt` combines all guides. `scripts/build-docs-markdown.mjs` generates these from the HTML bodies; do not edit generated Markdown. HTML pages advertise the index, and each documentation page advertises its Markdown alternate. This helps agents read the site; it does not guarantee search rankings or inclusion in AI answers.

`check:seo` validates all indexable pages, unique titles/descriptions, canonical URLs, sitemap coverage, social cards, JSON-LD and Markdown exports. `check:app-links` verifies the app link snapshot in `content/app-doc-links.json`. To audit a current app checkout instead:

```sh
npm run check:app-links -- ../firetower
```

The snapshot records the audited app commit. Update it when app links change. The app currently links to `/docs` and the installer to `/docs/self-hosting`; the latter redirects to `/docs/architecture`. The `www` host redirect is managed by the existing hosting domain configuration, separate from path redirects.

After deployment, verify indexing and Core Web Vitals in Search Console and submit `https://usefiretower.com/sitemap.xml`. Local checks cannot establish production indexing or real-user performance.

## Downloads

`DownloadButton` detects the visitor's platform, including iPad desktop mode, and offers all supported alternatives. Unsupported or unknown platforms get the platform chooser.

The resolver reads GitHub's release list and selects stable `desktop-v*` and `mobile-v*` packages separately. It only uses asset URLs actually returned by GitHub. It excludes signatures, drafts and prereleases. iOS uses the existing TestFlight invitation. Results are cached locally for six hours, with one request shared by the page's buttons.

If GitHub is unavailable or rate-limited, the checked-in snapshot remains usable. Refresh that fallback periodically:

```sh
npm run sync:downloads
```

This does not require a GitHub token or a website backend. Unit tests cover release selection, asset validation and device detection.

## Images and branding

The homepage product views come from the approved v102 redesign. Workflow, sharing, phone and fallback examples are illustrative. The setup and workflow guides use step-by-step screenshots of real desktop components with sample API data, in both themes. Sharing, backup and update screenshots highlight the controls to use. Artifact and preview examples use the actual annotation picker. Native app update availability is simulated for capture; screenshots do not demonstrate a live installation, provider sign-in, backup or upgrade. Capturing them did not change the application repository.

Images and fonts are served locally. `image-sizes.json` reserves the correct image dimensions before loading. DM Sans is licensed under the SIL Open Font License. Agent logos retain their owners' branding; Cursor and Mistral artwork came from their official brand pages.

## Deployment

The existing GitHub Actions workflow deploys pull requests to expiring Firebase preview channels. A merge to `main` or a manual workflow run publishes the production site. Firebase uses project `firetower-prod-506201`, target `prod`, and the mappings in `.firebaserc`.

Run lint, unit tests, build, SEO and content checks before publishing. This implementation does not automatically deploy from a local development session.

## Languages

English is the default at `/` and `/enterprise`. French is available at `/fr` and `/fr/enterprise`. Both versions use the same components and are exported as complete HTML pages. Separate route-group layouts set the correct `html lang` at build time. The shared document lives in `app/_components/SiteDocument.tsx`; the global static 404 provides links to both homepages.

French copy lives in `app/_lib/i18n/fr.json`, keyed by the English source text. Pass `locale` to shared marketing components and use `translator(locale)` for visible copy and accessibility labels. Missing French translations fail rendering instead of silently leaking English. Product names, source commands and the actual application screenshots remain unchanged. Documentation is still in English and is labelled as such in French navigation; there are no placeholder French documentation URLs.

The EN/FR selector keeps the equivalent page, query and anchor, and remembers the explicit choice in `firetower-language` local storage. On English marketing pages, visitors whose preferred supported browser language is French see a dismissible French suggestion. An explicit saved language takes priority. No IP lookup, automatic redirect, cookie, translation API or server runtime is used. If storage is unavailable, the selector still navigates and the suggestion can still be dismissed.

Each marketing language has its own canonical, localized social images and metadata, reciprocal English/French `hreflang` links and an English `x-default`. Sitemap alternates only include published translations. Social image handlers are statically exported at stable URLs outside the route groups. The booking modal passes the selected locale to Calendly; event names and custom event copy are managed in Calendly.

Run `npm test`, `npm run build`, `npm run check:seo`, and `npm run check:content` after editing translations or routes. SEO checks assert document languages, reciprocal alternates, localized structured data, social cards and sitemap coverage. Language tests cover preference precedence, platform labels and keeping documentation links on their existing URLs.
