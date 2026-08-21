import { BinaryField } from "./BinaryField";
import Link from "next/link";
import { Octocat } from "./Octocat";
import { REPO_URL } from "../_lib/site";

/**
 * The hero runs in a different voice from the rest of the page: a bitmap
 * monospace over a field of ones and zeroes, where every section below it is
 * Archivo on a plain ground. That break is deliberate — the top of the page
 * is the machine talking, and everything after it is us.
 *
 * Left-aligned rather than centred, and sentence case rather than the
 * condensed uppercase used further down: a pixel face has square terminals
 * and no optical correction, so all-caps at this size turns into a wall.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BinaryField />

      {/* Ember sitting low and to the left, the way light does at dusk. */}
      <div
        className="pointer-events-none absolute -bottom-40 -left-32 h-[560px] w-[820px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,107,44,0.13), rgba(255,107,44,0.03) 58%, transparent)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1180px] px-5 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-24">
        <p className="eyebrow rise flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Open source</span>
          <span className="text-line">/</span>
          <span>Self-hosted</span>
          <span className="text-line">/</span>
          <span>No account</span>
        </p>

        <h1
          className="pixel rise mt-6 text-[clamp(1.9rem,5.15vw,4rem)]"
          style={{ animationDelay: "60ms" }}
        >
          Run any coding agent,
          <br />
          on your own servers,
          <br />
          <span className="text-ember">from anywhere.</span>
          <span
            className="caret ml-2 inline-block h-[0.78em] w-[0.45em] translate-y-[0.06em] bg-ember align-baseline"
            aria-hidden
          />
        </h1>

        <div className="mt-9 max-w-[56ch]">
          <p
            className="rise text-[16px] leading-[1.62] text-dim"
            style={{ animationDelay: "120ms" }}
          >
            Give Firetower a machine you can SSH into and a repository. It picks a host,
            cuts a branch, makes a worktree, starts tmux, launches the agent and keeps it
            running. Then it does the part that actually costs you time:{" "}
            <span className="text-text">it tells you the moment it stops being useful without you.</span>
          </p>

          <div
            className="rise mt-7 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
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
      </div>

    </section>
  );
}
