"use client";

import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { preferredLanguage, type Locale } from "../../_lib/i18n";
import "./language-switch.css";

const preferenceKey = "firetower-language";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("firetower-language-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("firetower-language-change", callback);
  };
}
function preference() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(preferenceKey);
  } catch {}
  return preferredLanguage(navigator.languages, saved);
}
function remember(locale: Locale) {
  try {
    localStorage.setItem(preferenceKey, locale);
  } catch {}
  window.dispatchEvent(new Event("firetower-language-change"));
}
const serverPreference = () => "en" as const;

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const preferred = useSyncExternalStore(
    subscribe,
    preference,
    serverPreference,
  );
  const english = pathname === "/fr" ? "/" : pathname.replace(/^\/fr\//, "/");
  if (
    english !== "/" &&
    english !== "/enterprise" &&
    english !== "/docs" &&
    !english.startsWith("/docs/")
  )
    return null;
  const french = english === "/" ? "/fr" : `/fr${english}`;
  return (
    <>
      <div
        className="language-switch"
        role="group"
        aria-label={locale === "fr" ? "Langue du site" : "Website language"}
      >
        {(["en", "fr"] as const).map((language) => (
          <a
            key={language}
            href={language === "en" ? english : french}
            hrefLang={language}
            lang={language}
            aria-label={language === "en" ? "English" : "Français"}
            aria-current={locale === language ? "page" : undefined}
            onClick={(event) => {
              remember(language);
              // Keep the section and any campaign query when changing language.
              event.currentTarget.href =
                (language === "en" ? english : french) +
                window.location.search +
                window.location.hash;
            }}
          >
            {language.toUpperCase()}
          </a>
        ))}
      </div>
      {locale === "en" && preferred === "fr" && !dismissed && (
        <aside
          className="language-suggestion"
          lang="fr"
          aria-label="Version française"
        >
          <span>Vous préférez le français ?</span>
          <a
            href={french}
            hrefLang="fr"
            onClick={(event) => {
              remember("fr");
              event.currentTarget.href =
                french + window.location.search + window.location.hash;
            }}
          >
            Voir le site en français <span aria-hidden="true">→</span>
          </a>
          <button
            type="button"
            aria-label="Continuer en anglais"
            onClick={() => {
              setDismissed(true);
              remember("en");
            }}
          >
            ×
          </button>
        </aside>
      )}
    </>
  );
}
