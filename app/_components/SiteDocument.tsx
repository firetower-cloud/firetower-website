import type { Locale } from "../_lib/i18n";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { JsonLd } from "../_components/JsonLd";
import { Analytics } from "../_components/Analytics";
import {
  organizationLd,
  softwareApplicationLd,
  webSiteLd,
} from "../_lib/structured-data";
import { META_DESCRIPTION, NAME, SITE_URL, TAGLINE } from "../_lib/site";

const dmSans = localFont({
  src: "../../public/fonts/dm-sans.woff2",
  variable: "--font-dm-sans",
  weight: "100 1000",
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
  authors: [{ name: "Westlabs LLC" }],
  creator: "Westlabs LLC",
  publisher: "Westlabs LLC",
  alternates: { canonical: "/" },
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
    description: META_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F8F7" },
    { media: "(prefers-color-scheme: dark)", color: "#161615" },
  ],
  colorScheme: "light dark",
};

export function SiteDocument({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  return (
    <html lang={locale} className={dmSans.variable} suppressHydrationWarning>
      <head>
        <link rel="describedby" href="/llms.txt" type="text/plain" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem('firetower-theme')==='dark'?'dark':'light'}catch{}`,
          }}
        />
      </head>
      <body>
        <JsonLd data={organizationLd()} />
        <JsonLd data={webSiteLd(locale)} />
        <JsonLd data={softwareApplicationLd()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
