"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS, SECTION_ORDER, href } from "../../docs/_lib/nav";

type Heading = { id: string; text: string };

/**
 * The sections of the page being read, taken from the page itself.
 *
 * Read out of the rendered article rather than parsed out of the MDX, because
 * the ids are `rehype-slug`'s and the only place they certainly exist is the
 * document it just made. A table of contents whose anchors are a second guess
 * at the same algorithm is a table of contents that silently rots.
 */
function useHeadings(path: string): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    setHeadings(
      [...document.querySelectorAll<HTMLElement>("article h2[id]")].map((h) => ({
        id: h.id,
        // Skipping the "#" permalink React puts first inside every heading.
        text: [...h.childNodes]
          .filter((n) => !(n instanceof HTMLElement && n.tagName === "A"))
          .map((n) => n.textContent ?? "")
          .join("")
          .trim(),
      })),
    );
  }, [path]);

  return headings;
}

/**
 * Which section you are in, so the list says where you are rather than only
 * where you could go.
 *
 * The heading nearest above the top of the window, not the one most visible:
 * what you are reading is whatever the last heading you passed introduced, and
 * the most-visible rule flickers between two of them on a short section.
 */
function useCurrent(headings: Heading[]): string | null {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const at = () => {
      let seen = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 120) seen = h.id;
      }
      // Nothing is "current" until the first heading has been reached.
      const first = document.getElementById(headings[0].id);
      setCurrent(first && first.getBoundingClientRect().top > 120 ? null : seen);
    };
    at();
    window.addEventListener("scroll", at, { passive: true });
    window.addEventListener("resize", at);
    return () => {
      window.removeEventListener("scroll", at);
      window.removeEventListener("resize", at);
    };
  }, [headings]);

  return current;
}

/**
 * The docs index, grouped. Sticky, because the thing you want while reading
 * page four is the way to page five.
 *
 * The page you are on opens into its own sections. Only that one: every page
 * expanded is a column nobody can scan, and the sections of a page you are not
 * reading are not a destination you are looking for.
 */
export function Sidebar() {
  const path = usePathname();
  const headings = useHeadings(path);
  const current = useCurrent(headings);

  return (
    <aside className="hidden w-[196px] shrink-0 md:block">
      <nav
        className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col gap-6 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-line"
        aria-label="Documentation"
      >
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
                      {on && headings.length > 0 && (
                        <ul className="mt-1 mb-1 ml-[11px] flex flex-col gap-px border-l border-line pl-2.5">
                          {headings.map((h) => (
                            <li key={h.id}>
                              <a
                                href={`#${h.id}`}
                                className={`block rounded-[4px] py-[3px] pr-1.5 pl-1.5 text-[12px] leading-[1.4] transition-colors ${
                                  current === h.id
                                    ? "text-bone"
                                    : "text-mute hover:text-text"
                                }`}
                              >
                                {h.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
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
