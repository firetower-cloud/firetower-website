/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { docsFor, href } from "../../(en)/docs/_lib/nav";
import { ThemeButton } from "./ThemeButton";
import { LanguageSwitch } from "./LanguageSwitch";
import { localizedHref, type Locale } from "../../_lib/i18n";
import { docsTranslator } from "../../_lib/i18n/docs";
type SearchEntry = {
  href: string;
  title: string;
  description: string;
  section: string;
  text: string;
};
export function DocsShell({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const t = docsTranslator(locale);
  const docs = docsFor(locale);
  const sections = [...new Set(docs.map((d) => d.section))];
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [error, setError] = useState(false);
  const search = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  async function openSearch() {
    setMenu(false);
    setQuery("");
    search.current?.showModal();
    input.current?.focus();
    if (entries.length) return;
    try {
      const res = await fetch(
        locale === "fr" ? "/fr/docs-search.json" : "/docs-search.json",
      );
      if (!res.ok) throw Error("Search unavailable");
      setEntries(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        void openSearch();
      }
      if (e.key === "Escape") {
        setMenu(false);
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  });
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const results = entries
    .filter((d) =>
      words.every((w) =>
        normalize(d.title + " " + d.description + " " + d.text).includes(w),
      ),
    )
    .sort(
      (a, b) =>
        Number(normalize(b.title).includes(normalize(query))) -
        Number(normalize(a.title).includes(normalize(query))),
    )
    .slice(0, 18);
  const navigate = () => {
    setMenu(false);
    search.current?.close();
  };
  return (
    <div className={"docs-site" + (menu ? " menu-open" : "")}>
      <a className="skip" href="#main-content">
        {t("Skip to content")}
      </a>
      <header className="header">
        <Link
          href={localizedHref("/", locale)}
          className="brand"
          aria-label={t("Firetower home")}
        >
          <img
            className="wordmark"
            src="/brand/wordmark.svg"
            width="153"
            height="30"
            alt="Firetower"
          />
        </Link>
        <span className="header-divider" />
        <nav className="header-tabs" aria-label="Section">
          <Link href={href("", locale)} aria-current="page">
            Documentation
          </Link>
        </nav>
        <div className="header-end">
          <a className="support-link" href="https://discord.gg/Y2HYVEhSc">
            {t("Contact us")}
          </a>
          <LanguageSwitch locale={locale} />
          <ThemeButton locale={locale} />
          <button
            id="menu"
            className="icon-button"
            ref={menuButton}
            aria-label={
              menu
                ? t("Close documentation navigation")
                : t("Open documentation navigation")
            }
            aria-expanded={menu}
            aria-controls="docs-navigation"
            onClick={() => setMenu(!menu)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar" id="docs-navigation">
          <button
            className="search-button"
            aria-label={t("Search documentation")}
            onClick={() => void openSearch()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10" cy="10" r="6" />
              <path d="m15 15 5 5" />
            </svg>
            {locale === "fr" ? "Rechercher…" : t("Search documentation")}
            <kbd>⌘ K</kbd>
          </button>
          <nav aria-label="Documentation">
            {sections.map((section) => (
              <section className="nav-group" key={section}>
                <h2>{section}</h2>
                {docs
                  .filter((d) => d.section === section)
                  .map((d) => (
                    <Link
                      key={d.id}
                      href={href(d.slug, locale)}
                      aria-current={
                        path === href(d.slug, locale) ? "page" : undefined
                      }
                      onClick={navigate}
                    >
                      {d.navTitle || d.title}
                    </Link>
                  ))}
              </section>
            ))}
          </nav>
        </aside>
        <button
          className="mobile-shade"
          aria-label={t("Close documentation navigation")}
          hidden={!menu}
          onClick={() => {
            setMenu(false);
            menuButton.current?.focus();
          }}
        />
        {children}
      </div>
      <dialog
        ref={search}
        id="search-dialog"
        aria-labelledby="search-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) search.current?.close();
        }}
      >
        <div className="dialog-top">
          <h2 id="search-title">{t("Search documentation")}</h2>
          <button
            onClick={() => search.current?.close()}
            aria-label={t("Close search")}
          >
            {t("Esc")}
          </button>
        </div>
        <label className="sr-only" htmlFor="search-input">
          {t("Search documentation")}
        </label>
        <input
          ref={input}
          id="search-input"
          value={query}
          placeholder={t("Find a guide or concept\u2026")}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              search.current
                ?.querySelector<HTMLAnchorElement>("#search-results a")
                ?.focus();
            }
          }}
        />
        <p id="search-count" role="status">
          {error
            ? t("Search is unavailable. Use the navigation to find a guide.")
            : entries.length
              ? locale === "fr"
                ? `${results.length} page${results.length === 1 ? "" : "s"} trouvée${results.length === 1 ? "" : "s"}`
                : `${results.length} matching pages`
              : t("Loading search…")}
        </p>
        <div id="search-results">
          {results.map((d) => (
            <Link href={d.href} key={d.href} onClick={navigate}>
              <small>{d.section}</small>
              <strong>{d.title}</strong>
              <p>{d.description}</p>
            </Link>
          ))}
          {entries.length > 0 && results.length === 0 && (
            <p className="no-results">
              {t("No results. Try “install”, “account” or “worker”.")}
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}
