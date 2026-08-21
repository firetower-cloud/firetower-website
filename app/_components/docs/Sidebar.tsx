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
                        {d.title}
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
