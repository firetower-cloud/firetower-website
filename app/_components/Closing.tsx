import Link from "next/link";
import { REPO_URL } from "../_lib/site";

/** The last thing on the page, said as big as it can be said. */
export function Closing() {
  return (
    <section id="start" className="pt-24 pb-20 sm:pt-45 sm:pb-30">
      <div className="mx-auto flex max-w-(--shell) flex-col items-center gap-[30px] px-5 text-center sm:px-8">
        <h2 className="display max-w-[1100px] text-[clamp(44px,7.6vw,112px)] leading-[0.95] tracking-[-0.055em]">
          Give It A Server. Close The Laptop.
        </h2>
        <p className="max-w-[520px] text-[18px] leading-[1.6] text-dim">
          Open source and self-hosted, with no account. Clients for macOS, Windows, iOS and
          Android.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5 font-mono text-[14px] tracking-[0.04em]">
          <Link
            href="/docs/getting-started"
            className="rounded-[3px] bg-ember px-[22px] py-[15px] font-semibold text-ink transition-opacity hover:opacity-90"
          >
            SELF-HOST IN 5 MIN &gt;
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-[3px] border border-rim px-[22px] py-[15px] text-bone transition-colors hover:bg-raise"
          >
            VIEW ON GITHUB
          </a>
        </div>
      </div>
    </section>
  );
}
