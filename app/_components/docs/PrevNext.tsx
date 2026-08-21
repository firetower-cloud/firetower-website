"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { neighbours } from "../../docs/_lib/nav";
import { href } from "../../docs/_lib/nav";

/**
 * The way onwards, at the foot of every page.
 *
 * Not decoration: a documentation set where each page is a dead end is a
 * documentation set search engines read as seven unrelated pages, and readers
 * leave at the bottom of whichever one they landed on.
 */
export function PrevNext() {
  const path = usePathname();
  const slug = path === "/docs" ? "" : path.replace(/^\/docs\/?/, "");
  const { prev, next } = neighbours(slug);
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 grid max-w-[74ch] gap-3 sm:grid-cols-2" aria-label="More documentation">
      {prev ? (
        <Link
          href={href(prev.slug)}
          className="group rounded-[6px] border border-line px-4 py-3 transition-colors hover:border-ember-deep"
        >
          <span className="eyebrow">Previous</span>
          <span className="mt-1 block text-[14px] text-bone">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={href(next.slug)}
          className="group rounded-[6px] border border-line px-4 py-3 text-right transition-colors hover:border-ember-deep sm:col-start-2"
        >
          <span className="eyebrow">Next</span>
          <span className="mt-1 block text-[14px] text-bone">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
