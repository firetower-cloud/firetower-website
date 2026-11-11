import { docsFor } from "../../(en)/docs/_lib/nav";
import { SITE_URL } from "../../_lib/site";
export const dynamic = "force-static";
export function GET() {
  const docs = docsFor("fr");
  const sections = [...new Set(docs.map((d) => d.section))];
  const body = `# Documentation Firetower

> Firetower permet de faire travailler des équipes d’agents IA sur votre infrastructure. Choisissez vos agents, vos modèles et vos abonnements.

Les guides ci-dessous décrivent l’installation, les outils, le travail des agents, les accès et la maintenance. Les libellés des boutons restent conformes à l’application. Les captures utilisent des données d’exemple.

${sections
  .map(
    (section) =>
      `## ${section}\n\n${docs
        .filter((d) => d.section === section)
        .map(
          (d) =>
            `- [${d.title}](${SITE_URL}/fr/docs/${d.slug || "index"}.md): ${d.description}`,
        )
        .join("\n")}`,
  )
  .join("\n\n")}

## Autres ressources

- [Documentation complète en français](${SITE_URL}/fr/llms-full.txt): Tous les guides dans un seul fichier Markdown.
- [Site en français](${SITE_URL}/fr): Présentation de Firetower.
- [Offre Entreprise](${SITE_URL}/fr/enterprise): Déploiement, workflows et assistance.
- [Documentation en anglais](${SITE_URL}/llms.txt): Index des guides d’origine.
`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
