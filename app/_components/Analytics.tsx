import Script from "next/script";
import { GA_MEASUREMENT_ID } from "../_lib/site";

/**
 * Google Analytics 4.
 *
 * `next/script` rather than two raw `<script>` tags: in the App Router a bare
 * inline script in a server component is rendered but never guaranteed to run
 * in order relative to the loader, and React strips `async` handling on
 * hydration. `Script` gives both tags one queue and one strategy.
 *
 * `afterInteractive` — the default, and the right one here. `beforeInteractive`
 * would put a third-party request ahead of the page's own JavaScript to
 * measure a page that has not painted yet; `lazyOnload` waits for idle and
 * loses the visits that bounce before it. Analytics is not on the critical
 * path, but it should not be last either.
 *
 * The `preconnect` is what keeps that honest: the DNS lookup and TLS handshake
 * to Google's host start while the page is still parsing, so when the loader
 * does fire it is a warm connection rather than three round trips.
 */
export function Analytics() {
  return (
    <>
      <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      {/*
        `id` is required on an inline Script — it is the key Next uses to
        guarantee the body is evaluated exactly once, and without it the
        snippet re-runs on every client navigation and double-counts.
      */}
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
