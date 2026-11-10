import { notFound } from "next/navigation";
import { DOCS } from "../../docs/_lib/nav";
import { renderOgImage } from "../../_lib/og";
export const dynamic = "force-static";
export const dynamicParams = false;
const images = DOCS.flatMap(doc => (["og", "x"] as const).map(format => ({ image: `docs-${doc.id}-${format}.png`, doc, format })));
export function generateStaticParams() { return images.map(({ image }) => ({ image })); }
export async function GET(_request: Request, { params }: { params: Promise<{ image: string }> }) {
  const { image } = await params;
  const match = images.find(item => item.image === image);
  if (!match) notFound();
  return renderOgImage({ title: match.doc.title, description: match.doc.description, section: match.doc.section, path: `usefiretower.com/docs${match.doc.slug ? "/" + match.doc.slug : ""}`, format: match.format });
}
