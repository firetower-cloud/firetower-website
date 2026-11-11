import { translator, type LocalizedProps } from "../../_lib/i18n";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Workflows } from "./Workflows";
import { ProductTour } from "./ProductTour";
import { Architecture } from "./Architecture";
import { EnterpriseCallout } from "./EnterpriseCallout";
import { Enterprise } from "./Enterprise";
import { Subscriptions } from "./Subscriptions";
import { FAQ } from "./FAQ";
import { Closing } from "./Closing";
import { Footer } from "./Footer";
import { TowerDefinitions } from "./Tower";
import { JsonLd } from "../JsonLd";
import { webPageLd } from "../../_lib/structured-data";
import "./home.css";
export function HomePage({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  return (
    <div className="marketing-site">
      <a className="skip-link" href="#main-content">
        {t("Skip to content")}
      </a>
      <TowerDefinitions />
      <JsonLd data={webPageLd(locale)} />
      <Header locale={locale} />
      <main id="main-content">
        <Hero locale={locale} />
        <ProductTour locale={locale} />
        <Architecture locale={locale} />
        <Enterprise locale={locale} />
        <EnterpriseCallout locale={locale} />
        <Workflows locale={locale} />
        <Subscriptions locale={locale} />
        <FAQ locale={locale} />
        <Closing locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
