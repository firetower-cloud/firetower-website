import type { ReactNode } from "react";

/* ── The set of things a docs page can reach for ─────────────────────────
   Deliberately small. Every extra component is another way for two pages to
   say the same thing differently, and most of these docs are commands with a
   sentence around them. */

/**
 * For the things that cost you work if you skim them, and nothing else.
 * A page of callouts is a page with no hierarchy.
 */
export function Callout({
  kind = "note",
  children,
}: {
  kind?: "note" | "warning";
  children: ReactNode;
}) {
  const warn = kind === "warning";
  return (
    <div
      className={`mt-5 rounded-[6px] border px-4 py-3 ${
        warn ? "border-ember/30 bg-ember/[0.05]" : "border-line bg-panel"
      }`}
    >
      <p className={`eyebrow ${warn ? "text-ember" : ""}`}>{warn ? "This loses work" : "Note"}</p>
      <div className="[&>p]:mt-1.5 [&>p]:text-[13.5px] [&>p]:leading-[1.65] [&>p:first-child]:mt-1.5">
        {children}
      </div>
    </div>
  );
}

/** A command and what it prints back. */
export function Output({ children }: { children: ReactNode }) {
  return (
    <pre className="-mt-1 overflow-x-auto rounded-b-[6px] border border-t-0 border-line bg-ground/60 px-3.5 py-3 font-mono text-[12px] leading-[1.7] text-mute">
      {children}
    </pre>
  );
}

/** An environment variable, or any other name-and-meaning pair. */
export function Fields({ children }: { children: ReactNode }) {
  return <dl className="mt-5 divide-y divide-line-soft rounded-[6px] border border-line">{children}</dl>;
}

export function Field({
  name,
  children,
  hint,
}: {
  name: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-5">
      <dt className="font-mono text-[12.5px] break-words text-slate">
        {name}
        {hint && <span className="mt-0.5 block font-sans text-[11px] text-mute">{hint}</span>}
      </dt>
      <dd className="text-[13.5px] leading-[1.65] text-dim">{children}</dd>
    </div>
  );
}

/**
 * The lede under an h1: one paragraph, larger, that says what the page is.
 *
 * A `div`, not a `p`. MDX parses the text inside a JSX block as markdown and
 * wraps it in its own paragraph, so a `p` here nests a `p` inside a `p` — the
 * browser silently un-nests it, the server does not, and React throws a
 * hydration mismatch on every docs page.
 */
export function Lede({ children }: { children: ReactNode }) {
  return (
    <div className="-mt-1 mb-2 [&>p]:mt-0 [&>p]:text-[16px] [&>p]:leading-[1.65] [&>p]:text-text">
      {children}
    </div>
  );
}

/**
 * Which machine a block of commands belongs on.
 *
 * The single most common way to get lost in self-hosting instructions is not
 * knowing whether the terminal in front of you is the right one, so every
 * command on the install page sits under one of these.
 */
export function Where({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 flex items-center gap-2.5 rounded-[5px] border border-line-soft bg-raise/40 px-3 py-2">
      <span className="font-mono text-[11px] text-ember">▶</span>
      <span className="font-narrow text-[10px] font-semibold tracking-[0.16em] text-mute uppercase">
        Run this on
      </span>
      <span className="text-[13px] text-bone">{children}</span>
    </p>
  );
}
