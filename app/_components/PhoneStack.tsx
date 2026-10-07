"use client";

import { useMemo, useRef } from "react";
import { Canvas, box, pad } from "../_lib/ascii";
import { useFrames } from "../_lib/frames";

/* ── The four layers, on a phone ─────────────────────────────────────────
   The desktop version of this is a ray-marched stack you take apart by
   scrolling. None of that survives the trip: two hundred columns on a
   390px screen is a three-pixel smudge, and four screens of pinned
   scrolling to look at a smudge is worse than no drawing at all.

   So this is a different drawing of the same idea rather than the same
   drawing shrunk. The stack is read the way it is actually built — top
   down, devices to agents — as four boxes forty-six columns wide, joined
   by wires with something travelling down them. Nothing is pinned, nothing
   is hijacked, and every character is legible at arm's length.
   ─────────────────────────────────────────────────────────────────────── */

/** Wide enough to hold a hostname and an IP, narrow enough to read at 11px. */
const COLS = 46;
/** Where the wire between two boxes runs. */
const WIRE = 22;
/* b box · t name · l quiet · a status · p packet */
const KEYS = ["b", "t", "l", "a", "p"] as const;

type Layer = {
  n: string;
  title: string;
  body: string;
  /** Each line, and the spans inside it that carry a status rather than a fact. */
  rows: { text: string; lit?: [number, number][] }[];
  /** What the wire down to the next layer carries. */
  wire?: string;
};

const LAYERS: Layer[] = [
  {
    n: "LAYER 04",
    title: "Your Devices",
    body: "Mac, Windows, iPhone, Android. Start a session on one, pick it up on another. Closing any of them stops nothing.",
    rows: [
      { text: "[ laptop  ]  closed 6h 41m ago" },
      { text: "[ phone   ]  picked up, 9:41", lit: [[13, 28]] },
      { text: "[ desktop ]  idle" },
    ],
    wire: "https",
  },
  {
    n: "LAYER 03",
    title: "Firetower Server",
    body: "The control plane, about 200 MB. It tracks every workspace, and if it goes down it catches up by replay.",
    rows: [
      { text: "firetower              control plane" },
      { text: "inbox 2 waiting, logs replayed", lit: [[6, 15]] },
      { text: "about 200 MB" },
    ],
    wire: "ssh",
  },
  {
    n: "LAYER 02",
    title: "Workers",
    body: "One per machine you own, reached over SSH. A worker never opens a port and writes its own log before reporting.",
    rows: [
      { text: "Mac Studio   192.168.1.57   up" },
      { text: "Hetzner VM   5.161.44.9     up" },
      { text: "homelab      10.0.0.12      up" },
    ],
    wire: "tmux",
  },
  {
    n: "LAYER 01",
    title: "Agents",
    body: "Any coding agent, in tmux, on its own git worktree and branch. This is where the work happens.",
    rows: [
      { text: "o Claude Code  westlabs/ledger  working" },
      { text: "o Codex        westlabs/api     working" },
      { text: "* Claude Code  acme/web-app     needs you", lit: [[0, 1], [31, 40]] },
    ],
  },
];

/** A box, plus the three rows of wire that leave it for the layer below. */
function paint(layer: Layer, frame: number, reduced: boolean) {
  const lines = box(COLS, layer.rows.map((r) => r.text));
  const rows = lines.length + (layer.wire ? 3 : 0);
  const canvas = new Canvas(rows, COLS);

  lines.forEach((line, r) => {
    const inner = r > 0 && r < lines.length - 1;
    canvas.text(r, 0, line, "b", true);
    if (!inner) return;
    // The box frame is scaffolding; what is written inside it is not.
    const row = layer.rows[r - 1];
    canvas.text(r, 2, pad(row.text, COLS - 4), "t", true);
    canvas.set(r, 0, "|", "b");
    canvas.set(r, COLS - 1, "|", "b");
    for (const [a, b] of row.lit ?? []) canvas.text(r, 2 + a, row.text.slice(a, b), "a");
  });

  if (layer.wire) {
    const top = lines.length;
    // One packet, falling the three rows to the next box.
    const at = reduced ? -1 : Math.floor(frame / 3) % 3;
    for (let i = 0; i < 3; i++) {
      canvas.set(top + i, WIRE, i === at ? "*" : "|", i === at ? "p" : "b");
    }
    canvas.text(top, WIRE + 3, layer.wire, "l");
  }

  return canvas.split(KEYS) as Record<(typeof KEYS)[number], string>;
}

export function PhoneStack() {
  const host = useRef<HTMLOListElement>(null);
  const { frame, reduced } = useFrames(110, { watch: host });

  const scenes = useMemo(
    () => LAYERS.map((layer) => paint(layer, frame, reduced)),
    [frame, reduced],
  );

  return (
    <section aria-labelledby="stack-heading" className="mx-auto max-w-[640px] px-5 pt-20 sm:px-8">
      <div className="flex flex-col gap-4">
        <p className="eyebrow">[ HOW IT WORKS ]</p>
        <h2 id="stack-heading" className="display text-[34px]">
          Four-layer architecture
        </h2>
        <p className="text-[16px] leading-[1.6] text-dim">
          Top to bottom, this is the whole of it. Each layer is a separate thing that can
          stop without taking the others with it.
        </p>
      </div>

      <ol className="mt-10 flex flex-col [container-type:inline-size]">
        {LAYERS.map((layer, i) => (
          <li key={layer.n} className="flex flex-col gap-2 pb-3">
            <p className="eyebrow text-ember">{layer.n}</p>
            <h3 className="display text-[26px]">{layer.title}</h3>
            <p className="text-[15px] leading-[1.6] text-dim">{layer.body}</p>
            <div
              aria-hidden
              className="ascii relative mt-1 w-[46ch] text-[9px]"
              // Capped only so it stops growing on a tablet; on a phone the
              // width of the column is what decides it.
              style={{ fontSize: "min(14px, calc(100cqw / 28))" }}
            >
              <pre style={{ color: "var(--color-faint)" }}>{scenes[i].b}</pre>
              <pre style={{ color: "var(--color-text)" }}>{scenes[i].t}</pre>
              <pre style={{ color: "var(--color-mute)" }}>{scenes[i].l}</pre>
              <pre style={{ color: "var(--color-ember)" }}>{scenes[i].a}</pre>
              <pre
                style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}
              >
                {scenes[i].p}
              </pre>
              {/* The drawing is absolutely positioned layers, so the box needs
                  its height stated: rows of text, plus the wire if there is one. */}
              <span
                className="block"
                style={{ height: `calc(${layer.rows.length + 2 + (layer.wire ? 3 : 0)} * 1.15em)` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
