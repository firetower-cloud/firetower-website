import { EnterprisePageContent } from "../../_components/site/EnterprisePageContent";
import { marketingMetadata } from "../../_lib/i18n/metadata";
export const dynamic = "force-static";
export const metadata = marketingMetadata("en", "enterprise");
export default function Page() {
  return <EnterprisePageContent />;
}
