import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "./_lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Page not found — Firetower",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 640, margin: "15vh auto", padding: 24 }}>
          <p>Firetower · 404</p>
          <h1 style={{ margin: "16px 0" }}>Page not found</h1>
          <p>This address does not match a published page.</p>
          <nav
            aria-label="Return home"
            style={{ display: "flex", gap: 24, marginTop: 24 }}
          >
            <Link href="/" hrefLang="en">
              English homepage
            </Link>
            <Link href="/fr" hrefLang="fr" lang="fr">
              Accueil en français
            </Link>
          </nav>
        </main>
      </body>
    </html>
  );
}
