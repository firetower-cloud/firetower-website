import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JsonLd } from "./_components/JsonLd";
import { Analytics } from "./_components/Analytics";
import { organizationLd, softwareApplicationLd, webSiteLd } from "./_lib/structured-data";
import { META_DESCRIPTION, NAME, SITE_URL, TAGLINE } from "./_lib/site";

/**
 * The brand's two faces. Geist for everything that is read, Geist Mono for
 * everything that is a reading — labels, counters, commands, status. The
 * split is the whole typographic idea: prose is set like prose and the
 * instrument panel is set like an instrument panel, and nothing is in
 * between.
 *
 * Both are loaded as variable fonts — one file each, every weight from 100 to
 * 900 — so asking for 600 in a heading costs nothing extra. next/font fetches
 * them at build time and self-hosts the result, so there is still no CDN in
 * the request path, only in the build.
 */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/**
 * The third face exists for one job: the ASCII scenes.
 *
 * Those are character grids positioned in `ch` and `em` down to the cell, so
 * the face has to have an advance width that is exactly 0.6em and glyphs
 * that still read at 11px. JetBrains Mono has both, and it is checked in
 * rather than fetched because the hero is the first thing painted and a
 * character grid in a fallback metric is not a drawing, it is a smear.
 */
const jetbrains = localFont({
  src: "../public/fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
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
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${jetbrains.variable}`}>
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
