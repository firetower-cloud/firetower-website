import { HomePage } from "../_components/site/HomePage";
import { marketingMetadata } from "../_lib/i18n/metadata";
export const dynamic = "force-static";
export const metadata = marketingMetadata("en", "home");
export default function Page() {
  return <HomePage />;
}
