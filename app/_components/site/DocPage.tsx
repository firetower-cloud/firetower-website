import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { findDoc, neighbours, href } from "../../(en)/docs/_lib/nav";
import { DocBody } from "./DocBody";
import { JsonLd } from "../JsonLd";
import { docLd } from "../../_lib/structured-data";
import type { Locale } from "../../_lib/i18n";
export function DocPage({
  slug,
  locale = "en",
}: {
  slug: string;
  locale?: Locale;
}) {
  const doc = findDoc(slug, locale);
  const { prev, next } = neighbours(slug, locale);
  const body = readFileSync(
    join(
      process.cwd(),
      locale === "fr" ? "content/docs/fr" : "content/docs",
      doc.id + ".html",
    ),
    "utf8",
  );
  const toc = (
    <>
      {doc.headings.map((h) => (
        <a key={h.id} href={"#" + h.id}>
          {h.title}
        </a>
      ))}
    </>
  );
  return (
    <>
      <JsonLd data={docLd(slug, locale)} />
      <main id="main-content" className="content-grid">
        <article className="document">
          <div className="breadcrumb">
            <Link href={href("", locale)}>Documentation</Link>
            <span>/</span>
            <span>{doc.section}</span>
          </div>
          <header className="doc-heading">
            <h1>{doc.title}</h1>
            <p className="lead">{doc.description}</p>
            <div className="metadata">{doc.audience}</div>
          </header>
          {doc.headings.length > 2 && (
            <details className="toc-mobile">
              <summary>
                {locale === "fr" ? "Sur cette page" : "On this page"}
              </summary>
              <nav>{toc}</nav>
            </details>
          )}
          <DocBody html={body} locale={locale} />
          <nav
            className="pager"
            aria-label={
              locale === "fr"
                ? "Pages précédente et suivante"
                : "Adjacent pages"
            }
          >
            <div>
              {prev && (
                <Link href={href(prev.slug, locale)}>
                  <small>{locale === "fr" ? "Précédent" : "Previous"}</small>
                  {prev.title}
                </Link>
              )}
            </div>
            <div>
              {next && (
                <Link href={href(next.slug, locale)}>
                  <small>{locale === "fr" ? "Suivant" : "Next"}</small>
                  {next.title}
                </Link>
              )}
            </div>
          </nav>
          <p className="page-foot">
            {locale === "fr" ? "Besoin d’aide ? " : "Need help? "}
            <a href="https://discord.gg/Y2HYVEhSc">
              {locale === "fr" ? "Contactez-nous" : "Contact us"}
            </a>
            .
          </p>
        </article>
        <aside
          className="toc"
          aria-label={locale === "fr" ? "Sur cette page" : "On this page"}
        >
          <h2>{locale === "fr" ? "Sur cette page" : "On this page"}</h2>
          {toc}
        </aside>
      </main>
    </>
  );
}
