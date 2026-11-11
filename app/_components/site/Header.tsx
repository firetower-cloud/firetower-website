/* eslint-disable @next/next/no-img-element */
"use client";
import { translator, localizedHref, type Locale } from "../../_lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import Link from "next/link";
import { useState } from "react";
import { ThemeButton } from "./ThemeButton";
import { DownloadButton } from "./DownloadButton";
import { EnterpriseContact } from "./EnterpriseContact";
import { DISCORD_URL, REPO_URL } from "../../_lib/site";
export function Header({
  enterprise = false,
  locale = "en",
}: {
  enterprise?: boolean;
  locale?: Locale;
}) {
  const t = translator(locale);
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <nav className="nav shell" aria-label={t("Main navigation")}>
        <Link
          className="logo"
          href={localizedHref("/", locale)}
          aria-label={t("Firetower home")}
        >
          <img
            className="wordmark"
            src="/brand/wordmark.svg"
            alt="Firetower"
            width="153"
            height="30"
          />
        </Link>
        <div
          className={"navlinks" + (open ? " open" : "")}
          id="site-navigation"
          onClick={() => setOpen(false)}
        >
          <Link href={localizedHref("/#tour", locale)}>{t("Product")}</Link>
          <Link href={localizedHref("/#architecture", locale)}>
            {t("Infrastructure")}
          </Link>
          <Link
            href={localizedHref("/enterprise", locale)}
            aria-current={enterprise ? "page" : undefined}
          >
            {t("Enterprise")}
          </Link>
          <Link href={localizedHref("/docs", locale)}>{t("Docs")}</Link>
          <div className="nav-community">
            <a
              className="community-link github-link"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("Firetower on GitHub")}
              title={t("Firetower on GitHub")}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </a>
            <a
              className="community-link discord-link"
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("Firetower on Discord")}
              title={t("Firetower on Discord")}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="nav-end">
          <LanguageSwitch locale={locale} />
          <ThemeButton locale={locale} />
          {enterprise ? (
            <EnterpriseContact locale={locale} />
          ) : (
            <DownloadButton locale={locale} />
          )}
          <button
            className="menu"
            aria-label={open ? t("Close navigation") : t("Open navigation")}
            aria-expanded={open}
            aria-controls="site-navigation"
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
