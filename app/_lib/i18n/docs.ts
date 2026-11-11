import type { Locale } from "./index";
const french: Record<string, string> = {
  "Skip to content": "Aller au contenu",
  "Firetower home": "Accueil Firetower",
  "Close documentation navigation": "Fermer le menu de la documentation",
  "Open documentation navigation": "Ouvrir le menu de la documentation",
  "Search documentation": "Rechercher dans la documentation",
  "Close search": "Fermer la recherche",
  "Find a guide or concept…": "Rechercher un guide ou un concept…",
  "Search is unavailable. Use the navigation to find a guide.":
    "La recherche est indisponible. Utilisez le menu pour trouver un guide.",
  "Loading search…": "Chargement de la recherche…",
  "No results. Try “install”, “account” or “worker”.":
    "Aucun résultat. Essayez « installation », « compte » ou « worker ».",
  Esc: "Échap",
};
export function docsTranslator(locale: Locale) {
  return (text: string) => {
    if (locale === "en") return text;
    const value = french[text];
    if (value === undefined)
      throw new Error(`Missing documentation translation: ${text}`);
    return value;
  };
}
