import type { Metadata } from "next";
import { NAME, SITE_URL, TAGLINE, META_DESCRIPTION } from "../site";
import { ENTERPRISE_TITLE, ENTERPRISE_DESCRIPTION } from "../enterprise";
import { localizedHref, type Locale } from "./index";

export const frenchHomeTitle =
  "Firetower — Vos équipes d’agents IA, sur votre infrastructure";
export const frenchHomeDescription =
  "Faites travailler vos équipes d’agents IA 24 h/24 sur votre infrastructure. Partagez compétences et abonnements, avec les agents et modèles de votre choix.";
export const frenchEnterpriseTitle =
  "Firetower Entreprise — Déploiement, workflows et support";
export const frenchEnterpriseDescription =
  "Déployez Firetower avec l’équipe produit. Configurez vos workflows d’agents, formez vos équipes et bénéficiez d’un accompagnement sur votre infrastructure.";

export function marketingMetadata(
  locale: Locale,
  page: "home" | "enterprise",
): Metadata {
  const en = page === "home" ? "/" : "/enterprise";
  const fr = localizedHref(en, "fr");
  const path = locale === "fr" ? fr : en;
  const title =
    page === "home"
      ? locale === "fr"
        ? frenchHomeTitle
        : `${NAME} — ${TAGLINE}`
      : locale === "fr"
        ? frenchEnterpriseTitle
        : ENTERPRISE_TITLE;
  const description =
    page === "home"
      ? locale === "fr"
        ? frenchHomeDescription
        : META_DESCRIPTION
      : locale === "fr"
        ? frenchEnterpriseDescription
        : ENTERPRISE_DESCRIPTION;
  const imagePath = path === "/" ? "" : path;
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: {
        en: `${SITE_URL}${en}`,
        fr: `${SITE_URL}${fr}`,
        "x-default": `${SITE_URL}${en}`,
      },
      ...(page === "enterprise" && locale === "en"
        ? { types: { "text/markdown": `${SITE_URL}/enterprise.md` } }
        : {}),
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${path}`,
      siteName: NAME,
      title,
      description,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
      images: [
        {
          url: `${SITE_URL}${imagePath}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: `${SITE_URL}${imagePath}/twitter-image`,
          width: 1200,
          height: 600,
          alt: title,
        },
      ],
    },
  };
}
