"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { rng } from "../_lib/ascii";
import { useFrames } from "../_lib/frames";
import { AUTHOR, DISCORD_URL, LICENSE, REPO_URL, TAGLINE } from "../_lib/site";

/* ── The foot of the page ────────────────────────────────────────────────
   Links, the licence, and the name spelled out one last time in characters
   that keep re-deciding what they are made of — embers at the bottom of a
   fire that has not quite gone out.
   ─────────────────────────────────────────────────────────────────────── */

const LETTERS = [
  "XXXXXXX XX XXXXXX  XXXXXXX XXXXXXXX  XXXXXX  XX     XX XXXXXXX XXXXXX",
  "XX      XX XX   XX XX         XX    XX    XX XX     XX XX      XX   XX",
  "XXXXX   XX XXXXXX  XXXXX      XX    XX    XX XX  X  XX XXXXX   XXXXXX",
  "XX      XX XX   XX XX         XX    XX    XX XX XXX XX XX      XX   XX",
  "XX      XX XX   XX XXXXXXX    XX     XXXXXX   XXX XXX  XXXXXXX XX   XX",
];
const FILL = "@#8%$0";

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "GET STARTED",
    links: [
      { label: "Getting started", href: "/docs/getting-started" },
      { label: "Key concepts", href: "/docs/self-hosting" },
      { label: "Add a machine", href: "/docs/self-hosting/machines/install" },
      { label: "Connect GitHub", href: "/docs/connect-github" },
    ],
  },
  {
    title: "TEAMS",
    links: [
      { label: "Users and teams", href: "/docs/permissions/people" },
      { label: "Permissions", href: "/docs/permissions" },
      { label: "Sharing", href: "/docs/permissions/sharing" },
    ],
  },
  {
    title: "PROJECT",
    links: [
      { label: "GitHub", href: REPO_URL, external: true },
      { label: "Contributing", href: `${REPO_URL}/blob/main/CONTRIBUTING.md`, external: true },
      { label: "Discord", href: DISCORD_URL, external: true },
    ],
  },
];

export function Footer() {
  const host = useRef<HTMLElement>(null);
  const { frame } = useFrames(630, { watch: host });

  const wordmark = useMemo(
    () =>
      LETTERS.map((row, ri) => {
        let out = "";
        for (let ci = 0; ci < row.length; ci++) {
          out +=
            row[ci] === "X"
              ? FILL[Math.floor(rng(ri * 997 + ci * 31 + frame * 7919)() * FILL.length)]
              : " ";
        }
        return out;
      }).join("\n"),
    [frame],
  );

  return (
    <footer ref={host} className="overflow-hidden border-t border-line pt-14 pb-8">
      <div className="mx-auto flex max-w-(--shell) flex-col gap-14 px-5 sm:px-8">
        <div className="flex flex-wrap justify-between gap-x-16 gap-y-10">
          <div className="flex flex-[1_1_280px] flex-col gap-3">
            <p className="max-w-[300px] text-[15px] leading-[1.6] text-dim">{TAGLINE}</p>
            <p className="max-w-[340px] font-mono text-[12px] leading-[1.7] text-mute">
              {LICENSE}. © {AUTHOR}.
            </p>
          </div>

          <nav aria-label="Footer" className="grid flex-[2_1_520px] grid-cols-2 gap-x-6 gap-y-8 text-[15px] sm:flex sm:flex-wrap sm:gap-x-12">
            {COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-[1_1_160px] flex-col">
                <p className="eyebrow pb-2.5 text-[12px] text-mute">{column.title}</p>
                {column.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="py-1.5 text-dim transition-colors hover:text-bone"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="py-1.5 text-dim transition-colors hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </nav>
        </div>

        <pre
          aria-label="Firetower"
          className="m-0 overflow-hidden text-center font-mono text-[clamp(7px,1.5vw,19.5px)] leading-[1.05] whitespace-pre text-faint select-none"
        >
          {wordmark}
        </pre>
      </div>
    </footer>
  );
}
