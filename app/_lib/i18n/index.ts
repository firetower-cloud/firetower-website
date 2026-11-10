import french from "./fr.json";

export type Locale = "en" | "fr";
export type LocalizedProps = { locale?: Locale };

/** English copy is the translation key. New French copy must be reviewed here. */
export function translator(locale: Locale) {
  return (text: string): string => {
    if (locale === "en") return text;
    const translated = (french as Record<string, string>)[text];
    if (translated === undefined)
      throw new Error(`Missing French translation: ${text}`);
    return translated;
  };
}

export { localizedHref, preferredLanguage } from "./routing";
