type Locale = "en" | "fr";

/** Link published pages and their Markdown versions in the selected language. */
export function localizedHref(path: string, locale: Locale): string {
  if (locale === "en") return path;
  if (path === "/" || path.startsWith("/#")) return `/fr${path.slice(1)}`;
  if (path === "/enterprise" || path.startsWith("/enterprise#"))
    return `/fr${path}`;
  if (/^\/docs(?:[/?#]|$)/.test(path)) return `/fr${path}`;
  return path;
}

export function preferredLanguage(
  languages: readonly string[],
  saved?: string | null,
): Locale {
  if (saved === "en" || saved === "fr") return saved;
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    if (base === "en" || base === "fr") return base;
  }
  return "en";
}
