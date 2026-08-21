import type { Metadata } from "next";
import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { Inbox } from "./_components/Inbox";
import { How } from "./_components/How";
import { Footer } from "./_components/Footer";
import { META_DESCRIPTION, NAME, TAGLINE } from "./_lib/site";

/**
 * The landing page. Nothing here reads a request, so the whole route is
 * prerendered at build time — no runtime, no cold start, no per-visit work.
 */
export const dynamic = "force-static";

export const metadata: Metadata = {
  // Absolute, so the one page that is the site does not get the "— Firetower"
  // suffix appended to a title that already ends in the product's name.
  title: { absolute: `${NAME} — ${TAGLINE}` },
  description: META_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Inbox />
        <How />
      </main>
      <Footer />
    </>
  );
}
