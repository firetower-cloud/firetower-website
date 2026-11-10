/* eslint-disable @next/next/no-img-element */
/* Approved website design, implemented as React components. */
import { translator, type LocalizedProps } from "../../_lib/i18n";
import { DownloadButton } from "./DownloadButton";
export function Closing({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  return (
    <section className="shell">
      <div className="closing">
        <img
          className="closing-art"
          src="/brand/decoration-1.webp"
          alt=""
          aria-hidden="true"
        />
        <div className="closing-content">
          <h2>
            {t("Bring your agent teams")}
            <br />
            {t("to Firetower.")}
          </h2>
          <p>
            {t("Your infrastructure. Your accounts.")}
            <br />
            {t("One place to manage the work.")}
          </p>
          <DownloadButton locale={locale} />
        </div>
      </div>
    </section>
  );
}
