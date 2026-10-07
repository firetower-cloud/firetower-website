"use client";

import { useState } from "react";

/** The one line that installs everything. Said the same way everywhere. */
export const INSTALL = "curl -fsSL https://usefiretower.com/install.sh | sh";

/**
 * The install command, with a copy button welded to its right-hand edge.
 *
 * The command is the primary call to action, so it is a field rather than a
 * code block: one tap on a phone, one click on a desktop, and the thing you
 * came for is on your clipboard. The `$` is drawn dimmer than the command
 * because it is a prompt, not something to paste.
 */
export function InstallCommand({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div
      className={`flex items-center rounded-[3px] border border-edge bg-panel/90 pl-4 ${className}`}
    >
      <code className="min-w-0 flex-auto overflow-x-auto whitespace-nowrap py-3.5 font-mono text-[13.5px] text-text">
        <span className="text-mute">$ </span>
        {INSTALL}
      </code>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy install command"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(INSTALL);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            /* Clipboard denied — the text is selectable, which is the fallback. */
          }
        }}
        className="min-h-[46px] min-w-20 flex-none cursor-pointer border-0 border-l border-edge bg-transparent font-mono text-[12.5px] tracking-[0.04em] text-dim transition-colors hover:text-bone"
      >
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}
