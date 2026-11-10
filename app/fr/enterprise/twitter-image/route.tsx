import { renderOgImage } from "../../../_lib/og";
export const dynamic = "force-static";
export function GET() {
  return renderOgImage({
    title: "Votre infrastructure. Notre expertise.",
    footer: "Gratuit à auto-héberger. Un accompagnement selon vos besoins.",
    path: "usefiretower.com/fr/enterprise",
    format: "x",
    description:
      "Déploiement, workflows d’agents et support par l’équipe Firetower.",
    section: "Firetower pour les entreprises",
    label: "Entreprise",
  });
}
