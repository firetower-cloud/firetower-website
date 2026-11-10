"use client";
import { translator, type LocalizedProps } from "../../_lib/i18n";
export function ThemeButton({ locale = "en" }: LocalizedProps) {
  const t = translator(locale);
  return (
    <button
      className="theme-button"
      aria-label={t("Toggle light or dark theme")}
      onClick={() => {
        const theme =
          document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = theme;
        try {
          localStorage.setItem("firetower-theme", theme);
        } catch {}
      }}
    >
      <svg
        className="moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z" />
      </svg>
      <svg
        className="sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
      </svg>
    </button>
  );
}
