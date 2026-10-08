import type { Metadata } from "next";
import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { Divider } from "./_components/Divider";
import { Workflow } from "./_components/Workflow";
import { Anywhere } from "./_components/Anywhere";
import { Layers } from "./_components/Layers";
import { FailPlay } from "./_components/FailPlay";
import { Skills } from "./_components/Skills";
import { TokenWatch } from "./_components/TokenWatch";
import { Race } from "./_components/Race";
import { Setup } from "./_components/Setup";
import { Faq } from "./_components/Faq";
import { Closing } from "./_components/Closing";
import { Footer } from "./_components/Footer";
import { JsonLd } from "./_components/JsonLd";
import { webPageLd } from "./_lib/structured-data";
import { META_DESCRIPTION, NAME, TAGLINE } from "./_lib/site";

/**
 * The landing page.
 *
 * The order is an argument. The ridge, then the thing itself — the app on a
 * desktop and on a phone, because what it is has to land before why it is
 * built that way. Then the architecture, taken apart a layer at a time and
 * then set on fire. Then the two claims that need numbers — a shared skills
 * library and what the agents burn — and the one that needs a race.
 *
 * Setting it up comes last of the arguments: by then the reader either wants
 * it or does not, and three commands is the answer to "how much work is
 * this?" rather than an introduction to it. The questions, then the button.
 *
 * Nothing here reads a request, so the whole route is prerendered at build
 * time: no runtime, no cold start, no per-visit work. The drawings are
 * client components because they animate, but they animate from a frame
 * counter rather than data, so there is nothing to fetch.
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
      {/* The sitewide graph is in the root layout. This describes the page. */}
      <JsonLd data={webPageLd()} />
      <Nav />
      <main>
        <Hero />
        <Divider />
        <Workflow />
        <Anywhere />
        <Layers />
        <FailPlay />
        <Skills />
        <TokenWatch />
        <Race />
        <Setup />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
