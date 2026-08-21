import Link from "next/link";
import { Wordmark } from "./Mark";
import { Octocat } from "./Octocat";
import { AUTHOR, LICENSE, REPO_URL, TAGLINE } from "../_lib/site";
import { DOCS, href } from "../docs/_lib/nav";

/** The closing call, then the small print. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div
        className="pointer-events-none absolute -top-52 left-1/2 h-[620px] w-[1100px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,107,44,0.17), rgba(255,107,44,0.035) 56%, transparent)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1180px] px-5 pt-20 pb-14 text-center sm:px-8 sm:pt-28">
        <h2 className="display text-[clamp(2.2rem,6vw,4.4rem)]">
          Give it a server.
          <br />
          <span className="text-ember">Close the laptop.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[52ch] text-[15.5px] leading-[1.62] text-dim">
          {TAGLINE} It runs on your own machine, and there is no account.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="group flex items-center gap-2 rounded-[5px] bg-bone px-4 py-2.5 text-[13.5px] font-medium text-ground transition-opacity hover:opacity-88"
          >
            Read the documentation
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 rounded-[5px] border border-line px-4 py-2.5 text-[13.5px] text-text transition-colors hover:bg-raise hover:text-bone"
          >
            <Octocat />
            GitHub
          </a>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1180px] px-5 pb-10 sm:px-8">
        <div className="rule" />
        <div className="flex flex-col gap-6 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Wordmark size={18} />
            <p className="mt-2.5 text-[12.5px] text-mute">
              {LICENSE} · © {AUTHOR}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* The docs, not the page's own anchors: every page linking into
                them is what stops each one being a dead end. */}
            {DOCS.filter((d) => d.slug).map((d) => (
              <Link
                key={d.slug}
                href={href(d.slug)}
                className="text-[12.5px] text-mute transition-colors hover:text-bone"
              >
                {d.title}
              </Link>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[12.5px] text-mute transition-colors hover:text-bone"
            >
              GitHub ↗
            </a>
            <a
              href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[12.5px] text-mute transition-colors hover:text-bone"
            >
              Contributing ↗
            </a>
          </nav>
        </div>

        <p className="mt-7 max-w-[70ch] text-[12px] leading-[1.6] text-mute/70">
          If you run a modified Firetower as a network service, you have to publish your
          changes.
        </p>
      </div>
    </footer>
  );
}
