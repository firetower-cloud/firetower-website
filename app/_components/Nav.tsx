import Link from "next/link";
import { Wordmark } from "./Mark";
import { REPO_URL } from "../_lib/site";

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
        <div className="flex items-center gap-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Firetower on GitHub"
            className="flex items-center gap-2 rounded-[5px] border border-line px-3 py-[7px] text-[12.5px] text-dim transition-colors hover:border-line hover:bg-raise hover:text-bone"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38l-.01-1.49C3.76 14.2 3.3 12.9 3.3 12.9c-.36-.92-.88-1.16-.88-1.16-.72-.5.06-.48.06-.48.79.05 1.21.82 1.21.82.71 1.21 1.87.86 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="https://discord.com/invite/uVa8wsYym"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Join the Firetower community on Discord"
            className="flex items-center gap-2 rounded-[5px] border border-line px-3 py-[7px] text-[12.5px] text-dim transition-colors hover:border-line hover:bg-raise hover:text-bone"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.01c.12.099.246.197.373.291a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
            </svg>
            <span className="hidden sm:inline">Join the community</span>
          </a>
          <Link
            href="/docs"
            className="rounded-[5px] bg-bone px-3.5 py-[7px] text-[12.5px] font-medium text-ground transition-opacity hover:opacity-88"
          >
            Docs
          </Link>
        </div>
      </div>
    </header>
  );
}
