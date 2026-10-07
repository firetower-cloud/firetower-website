import Link from "next/link";
import { Wordmark } from "./Mark";
import { DISCORD_URL, REPO_URL } from "../_lib/site";

/**
 * The bar at the top of the tower: the mark, three links set as instrument
 * labels, and the one button that matters. It stays put, because the whole
 * page is an argument for running the thing and the way to do that should
 * never be more than a glance away.
 *
 * The links collapse below 760px rather than folding into a menu — on a
 * phone the only thing worth a tap up here is the button, and a hamburger
 * for three links is a drawer built to hide nothing.
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground/[0.82] backdrop-blur-xl">
      <div className="mx-auto flex max-w-(--shell) flex-wrap items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Link href="/" aria-label="Firetower, home" className="min-h-11 flex items-center">
          <Wordmark size={24} />
        </Link>
        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-1.5 font-mono text-[13px] tracking-[0.04em]"
        >
          <div className="hidden items-center gap-0.5 sm:flex">
            <Link href="/docs" className="px-3.5 py-3 text-dim transition-colors hover:text-bone">
              DOCS
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="px-3.5 py-3 text-dim transition-colors hover:text-bone"
            >
              GITHUB
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="px-3.5 py-3 text-dim transition-colors hover:text-bone"
            >
              COMMUNITY
            </a>
          </div>
          <Link
            href="/docs/getting-started"
            className="rounded-[3px] bg-bone px-4 py-[11px] font-semibold text-ground transition-opacity hover:opacity-90"
          >
            SELF-HOST &gt;
          </Link>
        </nav>
      </div>
    </header>
  );
}
