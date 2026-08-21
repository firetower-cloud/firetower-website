import Link from "next/link";
import { DOCS, href } from "../../docs/_lib/nav";

/**
 * The docs index as cards, on the index page.
 *
 * Built from the same manifest as the sidebar, so there is no way to add a
 * page and forget to link it from here — which is how documentation sets end
 * up with pages only search engines can find.
 */
export function DocsIndex() {
  return (
    <div className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-line bg-line sm:grid-cols-2">
      {DOCS.filter((d) => d.slug).map((d) => (
        <Link
          key={d.slug}
          href={href(d.slug)}
          className="group bg-panel px-4 py-4 transition-colors hover:bg-raise"
        >
          <span className="flex items-center gap-2 text-[14.5px] font-medium text-bone">
            {d.title}
            <span className="text-mute transition-transform group-hover:translate-x-0.5">→</span>
          </span>
          <span className="mt-1.5 block text-[13px] leading-[1.6] text-dim">{d.description}</span>
        </Link>
      ))}
    </div>
  );
}
