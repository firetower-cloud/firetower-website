import { HomePage } from "../../_components/site/HomePage";
import { marketingMetadata } from "../../_lib/i18n/metadata";
export const dynamic = "force-static";
export const metadata = marketingMetadata("fr", "home");
export default function Page() {
  return <HomePage locale="fr" />;
}
