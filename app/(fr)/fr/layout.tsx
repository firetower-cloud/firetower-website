import { SiteDocument } from "../../_components/SiteDocument";
export { metadata, viewport } from "../../_components/SiteDocument";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="fr">{children}</SiteDocument>;
}
