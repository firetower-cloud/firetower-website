import type { Metadata } from "next";
import { DocsShell } from "../_components/site/DocsShell";
import "./docs.css";
export const metadata: Metadata = {
  title: { default: "Documentation", template: "%s — Firetower docs" },
};
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsShell>{children}</DocsShell>;
}
