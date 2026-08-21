"use client";

import { useState } from "react";

/**
 * Copy-to-clipboard for the install block. The only interactive thing on the
 * page, so it is the only client component — everything else ships as HTML.
 */
export function Copy({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* Clipboard denied — the text is selectable, which is the fallback. */
        }
      }}
      aria-label={done ? "Copied" : label}
      className="flex shrink-0 items-center gap-1.5 rounded-[4px] border border-line px-2 py-1 font-mono text-[10.5px] tracking-wide text-mute uppercase transition-colors hover:border-ember-deep hover:text-ember"
    >
      {done ? (
        <>
          <svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path
              d="M1.5 5.8l2.6 2.6L9.5 3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <rect x="3.2" y="3.2" width="6.6" height="6.6" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8.2 3.2V2.4a1.2 1.2 0 00-1.2-1.2H3.4a1.2 1.2 0 00-1.2 1.2v3.6a1.2 1.2 0 001.2 1.2h.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
