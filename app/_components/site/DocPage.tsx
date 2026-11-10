import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { findDoc, neighbours, href } from "../../(en)/docs/_lib/nav";
import { DocBody } from "./DocBody";
import { JsonLd } from "../JsonLd";
import { docLd } from "../../_lib/structured-data";
export function DocPage({ slug }: { slug: string }) {
  const doc = findDoc(slug);
  const { prev, next } = neighbours(slug);
  const body = readFileSync(
    join(process.cwd(), "content/docs", doc.id + ".html"),
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
      <JsonLd data={docLd(slug)} />
      <main id="main-content" className="content-grid">
        <article className="document">
          <div className="breadcrumb">
            <Link href="/docs">Documentation</Link>
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
              <summary>On this page</summary>
              <nav>{toc}</nav>
            </details>
          )}
          <DocBody html={body} />
          <nav className="pager" aria-label="Adjacent pages">
            <div>
              {prev && (
                <Link href={href(prev.slug)}>
                  <small>Previous</small>
                  {prev.title}
                </Link>
              )}
            </div>
            <div>
              {next && (
                <Link href={href(next.slug)}>
                  <small>Next</small>
                  {next.title}
                </Link>
              )}
            </div>
          </nav>
          <p className="page-foot">
            Need help?{" "}
            <a href="https://discord.gg/Y2HYVEhSc">Contact us</a>.
          </p>
        </article>
        <aside className="toc" aria-label="On this page">
          <h2>On this page</h2>
          {toc}
        </aside>
      </main>
    </>
  );
}
