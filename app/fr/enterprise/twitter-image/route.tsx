import { renderOgImage } from "../../../_lib/og";
export const dynamic = "force-static";
export function GET() {
  return renderOgImage({
    title: "Votre infrastructure. Notre expertise.",
    footer: "Auto-hébergement gratuit. Un accompagnement selon vos besoins.",
    path: "usefiretower.com/fr/enterprise",
    format: "x",
    description:
      "Déploiement, workflows et assistance par l’équipe Firetower.",
    section: "Firetower pour les entreprises",
    label: "Entreprise",
  });
}
