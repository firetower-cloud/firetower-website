import type { Metadata } from "next";
import { Header } from "./_components/site/Header";
import { Hero } from "./_components/site/Hero";
import { Workflows } from "./_components/site/Workflows";
import { ProductTour } from "./_components/site/ProductTour";
import { Architecture } from "./_components/site/Architecture";
import { Enterprise } from "./_components/site/Enterprise";
import { Subscriptions } from "./_components/site/Subscriptions";
import { FAQ } from "./_components/site/FAQ";
import { Closing } from "./_components/site/Closing";
import { Footer } from "./_components/site/Footer";
import { TowerDefinitions } from "./_components/site/Tower";
import { JsonLd } from "./_components/JsonLd";
import { webPageLd } from "./_lib/structured-data";
import { NAME, TAGLINE, META_DESCRIPTION } from "./_lib/site";
import "./_components/site/home.css";
export const dynamic = "force-static";
export const metadata: Metadata = {
  title: { absolute: `${NAME} — ${TAGLINE}` },
  description: META_DESCRIPTION,
  alternates: { canonical: "/" },
};
export default function Home() {
  return (
    <div className="marketing-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <TowerDefinitions />
      <JsonLd data={webPageLd()} />
      <Header />
      <main id="main-content">
        <Hero />
        <ProductTour />
        <Architecture />
        <Enterprise />
        <Workflows />
        <Subscriptions />
        <FAQ />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
