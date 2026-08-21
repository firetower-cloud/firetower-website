import Link from "next/link";
import { Wordmark } from "./Mark";
import { REPO_URL, SECTIONS } from "../_lib/site";

/**
 * A thin instrument bar rather than a header: hairline underneath, nothing
 * above it, and the same condensed uppercase voice as the application's
 * sidebar. It stays put so the install command is always one click away.
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ground/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Firetower, home">
          <Wordmark size={20} />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[13px] text-dim transition-colors hover:text-bone"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 rounded-[5px] border border-line px-3 py-[7px] text-[12.5px] text-dim transition-colors hover:border-line hover:bg-raise hover:text-bone"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38l-.01-1.49C3.76 14.2 3.3 12.9 3.3 12.9c-.36-.92-.88-1.16-.88-1.16-.72-.5.06-.48.06-.48.79.05 1.21.82 1.21.82.71 1.21 1.87.86 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href={`${REPO_URL}#running-it`}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-[5px] bg-bone px-3.5 py-[7px] text-[12.5px] font-medium text-ground transition-opacity hover:opacity-88"
          >
            Run it
          </a>
        </div>
      </div>
    </header>
  );
}
