import Link from "next/link";
import { DOCS, SECTION_ORDER, href } from "../../docs/_lib/nav";

/**
 * The docs index, grouped the way the sidebar groups them.
 *
 * Built from the same manifest, so there is no way to add a page and forget to
 * link it from here — which is how documentation sets end up with pages only
 * search engines can find.
 */
export function DocsIndex() {
  return (
    <div className="mt-8 flex flex-col gap-8">
      {SECTION_ORDER.map((section) => {
        const items = DOCS.filter((d) => d.section === section && d.slug);
        if (!items.length) return null;
        return (
          <div key={section}>
            <p className="eyebrow mb-2.5">{section}</p>
            <div
              className={`grid gap-px overflow-hidden rounded-[6px] border border-line bg-line ${
                // A lone card should not sit beside an empty cell.
                items.length > 1 ? "sm:grid-cols-2" : ""
              }`}
            >
              {items.map((d) => (
                <Link
                  key={d.slug}
                  href={href(d.slug)}
                  className="group bg-panel px-4 py-3.5 transition-colors hover:bg-raise"
                >
                  <span className="flex items-center gap-2 text-[14px] font-medium text-bone">
                    {d.title}
                    <span className="text-mute transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-[1.55] text-dim">
                    {d.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
