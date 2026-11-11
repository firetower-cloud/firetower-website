import { notFound } from "next/navigation";
import { docsFor, href } from "../../(en)/docs/_lib/nav";
import { renderOgImage } from "../../_lib/og";
export const dynamic = "force-static";
export const dynamicParams = false;
const images = (["en", "fr"] as const).flatMap((locale) =>
  docsFor(locale).flatMap((doc) =>
    (["og", "x"] as const).map((format) => ({
      image: `${locale === "fr" ? "fr-" : ""}docs-${doc.id}-${format}.png`,
      doc,
      format,
      locale,
    })),
  ),
);
export function generateStaticParams() {
  return images.map(({ image }) => ({ image }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ image: string }> },
) {
  const { image } = await params;
  const match = images.find((item) => item.image === image);
  if (!match) notFound();
  return renderOgImage({
    title: match.doc.title,
    description: match.doc.description,
    section: match.doc.section,
    path: `usefiretower.com${href(match.doc.slug, match.locale)}`,
    footer:
      match.locale === "fr" ? "Documentation Firetower" : "Firetower docs",
    format: match.format,
  });
}
