import { renderOgImage } from "../../_lib/og";
export const dynamic = "force-static";
export function GET() {
  return renderOgImage({
    title: "Vos équipes d’agents IA. Votre infrastructure. 24 h/24.",
    footer: "Conçu pour les entreprises. Vos agents, vos modèles.",
    path: "usefiretower.com/fr",
    format: "og",
  });
}
