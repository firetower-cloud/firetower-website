import {
  translator,
  localizedHref,
  type LocalizedProps,
} from "../../_lib/i18n";
import Link from "next/link";
export function EnterpriseCallout({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  return (
    <aside
      className="enterprise-services-callout shell"
      aria-labelledby="enterprise-services-title"
    >
      <div>
        <h2 id="enterprise-services-title">
          {t("Deploy with the people building Firetower.")}
        </h2>
        <p>
          {t("Get help with deployment, agent workflows, and ongoing support.")}
        </p>
      </div>
      <Link
        className="button outline"
        href={localizedHref("/enterprise", locale)}
      >
        {t("Explore enterprise services")}
      </Link>
    </aside>
  );
}
