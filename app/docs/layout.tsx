import type { Metadata } from "next";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";
import { Sidebar } from "../_components/docs/Sidebar";
import { PrevNext } from "../_components/docs/PrevNext";
import { DocSchema } from "../_components/docs/DocSchema";

export const metadata: Metadata = {
  title: { default: "Documentation", template: "%s — Firetower docs" },
};

/**
 * The docs shell: one header shared with the marketing page, a sidebar, and a
 * column of prose narrow enough to read.
 *
 * `max-w-[74ch]` on the article is the only width that matters here — long
 * measure is the difference between documentation people read and
 * documentation people scan.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="mx-auto flex max-w-[1180px] gap-10 px-5 pt-10 pb-24 sm:px-8 lg:gap-16 lg:pt-14">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <DocSchema />
          <article className="max-w-[74ch]">{children}</article>
          <PrevNext />
        </main>
      </div>
      <Footer />
    </>
  );
}
