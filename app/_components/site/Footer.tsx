import {
  translator,
  localizedHref,
  type LocalizedProps,
} from "../../_lib/i18n";
import Link from "next/link";
export function Footer({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  return (
    <footer className="shell site-footer">
      <span>© {new Date().getFullYear()} Westlabs LLC</span>
      <nav aria-label={t("Footer")}>
        <Link href={localizedHref("/enterprise", locale)}>
          {t("Enterprise")}
        </Link>
        <Link href="/docs">
          {locale === "fr" ? "Documentation (EN)" : t("Documentation")}
        </Link>
        <a href="https://github.com/firetower-cloud/firetower">GitHub</a>
        <a href="https://discord.gg/Y2HYVEhSc">{t("Contact us")}</a>
        <a href="https://github.com/firetower-cloud/firetower/blob/main/LICENSE">
          AGPL-3.0
        </a>
      </nav>
    </footer>
  );
}
