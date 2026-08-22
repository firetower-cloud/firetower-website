import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { DotGothic16 } from "next/font/google";
import "./globals.css";
import { JsonLd } from "./_components/JsonLd";
import { Analytics } from "./_components/Analytics";
import { organizationLd, softwareApplicationLd, webSiteLd } from "./_lib/structured-data";
import { META_DESCRIPTION, NAME, SITE_URL, TAGLINE } from "./_lib/site";

/**
 * The same three faces the application uses, checked in rather than fetched
 * from a CDN: the site is built in CI and sometimes offline, and a build that
 * needs the network to render text fails for reasons that have nothing to do
 * with the change being made. All three are variable, so one file each covers
 * the whole weight range.
 */
const archivo = localFont({
  src: "../public/fonts/archivo.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
});

const archivoNarrow = localFont({
  src: "../public/fonts/archivo-narrow.woff2",
  variable: "--font-archivo-narrow",
  weight: "100 900",
  display: "swap",
});

const jetbrains = localFont({
  src: "../public/fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

/**
 * The one face the application does not have: a bitmap monospace, used for
 * the hero headline and nowhere else. The rest of the page keeps the
 * condensed uppercase voice, so the switch marks the hero as the machine
 * talking rather than becoming the site's default.
 *
 * DotGothic16 rather than one of the more obviously "pixel" display faces:
 * it is the only one on Google Fonts with square pixels, a real lowercase
 * and open enough counters to stay readable at 60px. The chunkier ones look
 * the part in a specimen and turn into a wall in a headline.
 *
 * next/font fetches it at build time and self-hosts the result, so there is
 * still no CDN in the request path — only in the build.
 */
const pixel = DotGothic16({
  subsets: ["latin"],
  variable: "--font-pixel-face",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${NAME} — ${TAGLINE}`,
    template: `%s — ${NAME}`,
  },
  description: META_DESCRIPTION,
  applicationName: NAME,
  category: "technology",
  keywords: [
    "coding agent control plane",
    "self-hosted coding agents",
    "run coding agents on your own server",
    "agent orchestration",
    "tmux agent sessions",
    "git worktree agents",
    "open source developer tools",
  ],
  authors: [{ name: "Westlabs LLC" }],
  creator: "Westlabs LLC",
  publisher: "Westlabs LLC",
  alternates: { canonical: "/", types: { "text/markdown": "/llms.txt" } },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: NAME,
    title: `${NAME} — ${TAGLINE}`,
    description: META_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — ${TAGLINE}`,
    description:
      "Give it a server you can SSH into. It cuts the branch, runs the agent, and tells you the moment it needs you.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoNarrow.variable} ${jetbrains.variable} ${pixel.variable}`}>
      <body>
        <JsonLd data={organizationLd()} />
        <JsonLd data={webSiteLd()} />
        <JsonLd data={softwareApplicationLd()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
