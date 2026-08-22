"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS, SECTION_ORDER, href } from "../../docs/_lib/nav";

/**
 * The docs index, grouped. Sticky, because the thing you want while reading
 * page four is the way to page five.
 *
 * A client component only so it can mark the current page — everything else
 * about it is static.
 */
export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="hidden w-[196px] shrink-0 md:block">
      <nav className="sticky top-24 flex flex-col gap-6" aria-label="Documentation">
        {SECTION_ORDER.map((section) => {
          const items = DOCS.filter((d) => d.section === section);
          if (!items.length) return null;
          return (
            <div key={section}>
              <p className="eyebrow mb-2">{section}</p>
              <ul className="flex flex-col gap-px">
                {items.map((d) => {
                  const to = href(d.slug);
                  const on = path === to;
                  return (
                    <li key={d.slug}>
                      <Link
                        href={to}
                        title={d.description}
                        className={`block rounded-[5px] px-2.5 py-[6px] text-[13px] transition-colors ${
                          on ? "bg-raise text-bone" : "text-dim hover:bg-raise/60 hover:text-text"
                        }`}
                      >
                        {d.navTitle ?? d.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * The same list on a phone, where there is no room for a column.
 *
 * A scrolling row rather than a menu behind a button: eleven pages fit, and a
 * navigation you have to open is a navigation most people do not know is
 * there. Titles rather than sidebar labels — there is no section heading here
 * to tell two "Application" chips apart.
 */
export function DocsRail() {
  const path = usePathname();

  return (
    <nav
      aria-label="Documentation"
      className="-mx-5 mb-8 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
    >
      {DOCS.map((d) => {
        const to = href(d.slug);
        const on = path === to;
        return (
          <Link
            key={d.slug}
            href={to}
            className={`shrink-0 rounded-[5px] border px-2.5 py-1.5 text-[12.5px] whitespace-nowrap transition-colors ${
              on ? "border-ember-deep bg-raise text-bone" : "border-line text-dim hover:text-text"
            }`}
          >
            {d.slug ? d.title : "Overview"}
          </Link>
        );
      })}
    </nav>
  );
}
