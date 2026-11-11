import { notFound } from "next/navigation";
import { DocPage } from "../../../_components/site/DocPage";
import { DOCS, docMeta } from "../_lib/nav";
export const dynamicParams = false;
export function generateStaticParams() {
  return DOCS.filter((d) => d.slug).map((d) => ({ slug: d.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!DOCS.some((d) => d.slug === slug)) notFound();
  return docMeta(slug);
}
export default async function DocumentationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!DOCS.some((d) => d.slug === slug)) notFound();
  return <DocPage slug={slug} />;
}
