"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "../JsonLd";
import { docLd } from "../../_lib/structured-data";

/**
 * The TechArticle and BreadcrumbList for whichever docs page this is.
 *
 * Derived from the path rather than passed down, so an .mdx file only ever
 * declares its metadata once — in the manifest — and cannot ship with schema
 * that describes a different page.
 */
export function DocSchema() {
  const path = usePathname();
  const slug = path === "/docs" ? "" : path.replace(/^\/docs\/?/, "");
  return <JsonLd data={docLd(slug)} />;
}
