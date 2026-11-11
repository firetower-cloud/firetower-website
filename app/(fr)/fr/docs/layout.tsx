import type { Metadata } from "next";
import { DocsShell } from "../../../_components/site/DocsShell";
import "../../../(en)/docs/docs.css";
export const metadata: Metadata = {
  title: {
    default: "Documentation Firetower",
    template: "%s — Documentation Firetower",
  },
};
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsShell locale="fr">{children}</DocsShell>;
}
