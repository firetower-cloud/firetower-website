"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, compact, repeat, rng, smooth } from "../_lib/ascii";
import { useFrames } from "../_lib/frames";
import { FIRE_COLS, FIRE_ROWS, paintPhoneFires } from "./PhoneFires";

/* ── Token watch ─────────────────────────────────────────────────────────
   One campfire per provider, its height set by what that provider is
   currently burning, and the tower's gaze easing over to whichever one you
   are reading. The panel beside it breaks the same number down by project,
   by issue and by teammate.

   A row of bar charts would say the same thing and be forgotten. Five fires
   of visibly different sizes on a ridge, with the biggest one roaring, says
   which of your agents is expensive before you have read a single label.
   ─────────────────────────────────────────────────────────────────────── */

const COLS = 124;
const ROWS = 30;
/** The row the fires stand on. */
const BASE = 22;
/* s sky · g ground · t tower · l quiet · n name · e flame edge · m flame · c core */
const KEYS = ["s", "g", "t", "l", "n", "e", "m", "c"] as const;

const PROVIDERS = [
  { name: "Claude Code", short: "CLAUDE CODE", rate: 412000, base: 3180000, cx: 12 },
  { name: "Codex", short: "CODEX", rate: 268000, base: 2040000, cx: 37 },
  { name: "Kimi", short: "KIMI", rate: 96000, base: 710000, cx: 62 },
  { name: "Grok", short: "GROK", rate: 54000, base: 410000, cx: 87 },
  { name: "Others", short: "OTHERS", rate: 12000, base: 90000, cx: 111 },
];

const DIMENSIONS = [
  { label: "By project", items: ["acme/web-app", "westlabs/ledger", "westlabs/api", "acme/mobile"] },
  {
    label: "By issue",
    items: [
      "ENG-142 Add a dark mode toggle",
      "ENG-139 Fix the invite link on mobile",
      "ENG-131 Rate-limit the webhook receiver",
      "ENG-128 Paginate the audit log API",
    ],
  },
  { label: "By teammate", items: ["kevin", "mara", "sam", "priya"] },
];

const TOWER = [
  "      .^.",
  "   _.' | '._",
  "  /_________\\",
  "   |[  ][  ]|",
  "  [==========]",
  "    |\\    /|",
  "    | \\  / |",
  "    |  \\/  |",
  "    |  /\\  |",
  "    | /  \\ |",
  "   /|/    \\|\\",
];
const TOWER_X = 55;

/** The tick, and how many ticks each provider holds the gaze for. */
const TICK_MS = 80;
const DWELL = 60;
/** How long the gaze takes to pan from one fire to the next, in ticks. */
const PAN = 14;

export function TokenWatch() {
  const host = useRef<HTMLElement>(null);
  const { frame, reduced } = useFrames(TICK_MS, { watch: host });
  const [dim, setDim] = useState(0);
  /** Set once somebody picks a fire: which one, and the pan it interrupted. */
  const [picked, setPicked] = useState<{ i: number; at: number; from: number } | null>(null);

  // Until somebody picks a provider, the tower walks the ridge on its own —
  // derived from the frame rather than kept on a second timer, so the gaze and
  // the fires can never get out of step with each other.
  const walking = Math.floor(frame / DWELL) % PROVIDERS.length;
  const sel = picked ? picked.i : walking;
  /* Where the gaze was before the current selection, and how far through the
     pan towards it we are. Both are functions of the frame, which is what lets
     the whole scene stay a pure drawing of one number. */
  const changedAt = picked ? picked.at : Math.floor(frame / DWELL) * DWELL;
  const cameFrom = picked
    ? picked.from
    : PROVIDERS[(walking + PROVIDERS.length - 1) % PROVIDERS.length].cx;
  const panned = reduced ? 1 : smooth(0, 1, Math.min(1, (frame - changedAt) / PAN));
  const gazeX = cameFrom + (PROVIDERS[sel].cx - cameFrom) * panned;

  function choose(next: number) {
    setPicked({ i: next, at: frame, from: gazeX });
  }

  /* One minute of burn per second of watching, so the counters are visibly
     alive without pretending to be real. Counted in frames, so they pause
     with the drawing rather than jumping when it scrolls back into view. */
  const hours = (frame * (TICK_MS / 1000) * 60) / 3600;
  const rates = PROVIDERS.map(
    (p, i) => p.rate * (1 + (reduced ? 0 : 0.07 * Math.sin(frame * 0.09 + i * 1.7))),
  );
  const todays = PROVIDERS.map((p) => p.base + p.rate * hours);
  const total = todays.reduce((s, v) => s + v, 0);

  const scene = useMemo(
    () => paint({ frame, reduced, rates, sel, gazeX }),
    [frame, reduced, rates, sel, gazeX],
  );
  const phone = useMemo(
    () => paintPhoneFires({ frame, reduced, rates, sel, names: PROVIDERS.map((p) => p.name) }),
    [frame, reduced, rates, sel],
  );

  // A stable, arbitrary split of one provider's spend across four things. Not
  // memoised: it is a sort of four items, and it has to follow a total that
  // moves every frame anyway.
  const rows = (() => {
    const R = rng(sel * 31 + dim * 7 + 3);
    const weights = [0.25 + R(), 0.2 + R() * 0.8, 0.1 + R() * 0.6, 0.05 + R() * 0.4];
    const sum = weights.reduce((a, b) => a + b, 0);
    const items = DIMENSIONS[dim].items
      .map((name, i) => ({ name, value: (todays[sel] * weights[i]) / sum }))
      .sort((a, b) => b.value - a.value);
    const BAR = 30;
    const max = items[0].value;
    return items.map((item) => {
      const filled = Math.max(1, Math.round((item.value / max) * BAR));
      return {
        name: item.name,
        value: compact(item.value),
        bar: repeat("#", filled),
        rest: repeat(".", BAR - filled),
      };
    });
  })();

  return (
    <section ref={host} id="tokens" aria-label="Token watch" className="pt-16 pb-16 sm:pt-24 sm:pb-26">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
          <div className="flex flex-[1_1_560px] flex-col gap-4">
            <p className="eyebrow">[ TOKEN WATCH ]</p>
            <h2 className="display h2 max-w-[820px]">
              Watch what every provider burns, by project, issue and teammate.
            </h2>
            <p className="max-w-[580px] text-[17px] leading-[1.6] text-dim">
              Claude Code, Codex, Kimi, Grok and the rest each burn tokens their own way,
              and none of them can see the others. Firetower watches all of them at once,
              and keeps the running total.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-[56px] leading-[0.9] font-semibold tracking-[-0.05em] text-bone">
              {compact(total)}
            </p>
            <p className="eyebrow">TOKENS TODAY, ALL PROVIDERS</p>
          </div>
        </div>

        <div className="flex flex-wrap items-stretch gap-5">
          {/* The same five fires, narrowed to a width a phone can read. */}
          <div className="w-full overflow-hidden border border-line-soft bg-sunk px-4 py-5 [container-type:inline-size] sm:hidden">
            <div
              aria-hidden
              className="ascii relative mx-auto w-[46ch] text-[8px]"
              style={{
                height: `calc(${FIRE_ROWS} * 1.15em)`,
                fontSize: `min(12px, calc(100cqw / ${FIRE_COLS * 0.62}))`,
              }}
            >
              <pre style={{ color: "#303035" }}>{phone.s}</pre>
              <pre style={{ color: "#55555b" }}>{phone.g}</pre>
              <pre style={{ color: "#d6d6da" }}>{phone.t}</pre>
              <pre style={{ color: "var(--color-label)" }}>{phone.l}</pre>
              <pre style={{ color: "var(--color-bone)" }}>{phone.n}</pre>
              <pre
                style={{ color: "var(--color-flare)", textShadow: "0 0 6px rgb(255 92 57 / 0.6)" }}
              >
                {phone.e}
              </pre>
              <pre
                style={{ color: "var(--color-ember)", textShadow: "0 0 7px var(--color-ember)" }}
              >
                {phone.m}
              </pre>
              <pre
                style={{
                  color: "var(--color-ember-bright)",
                  textShadow: "0 0 10px rgb(255 210 122 / 0.9)",
                }}
              >
                {phone.c}
              </pre>
            </div>
          </div>

          <div
            className="relative hidden min-w-0 flex-[1.6_1_620px] justify-center overflow-hidden border border-line-soft bg-sunk px-5 pt-6 pb-4 [container-type:inline-size] sm:flex"
          >
            <div
              className="ascii relative w-[124ch] text-[7px]"
              style={{ height: "calc(30 * 1.15em)", fontSize: "min(11px, calc(100cqw / 75.5))" }}
            >
              <pre aria-hidden style={{ color: "#303035" }}>{scene.layers.s}</pre>
              <pre aria-hidden style={{ color: "#55555b" }}>{scene.layers.g}</pre>
              <pre aria-hidden style={{ color: "#d6d6da" }}>{scene.layers.t}</pre>
              <pre aria-hidden style={{ color: "var(--color-label)" }}>{scene.layers.l}</pre>
              <pre aria-hidden style={{ color: "var(--color-bone)" }}>{scene.layers.n}</pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-flare)", textShadow: "0 0 6px rgb(255 92 57 / 0.6)" }}
              >
                {scene.layers.e}
              </pre>
              <pre
                aria-hidden
                style={{ color: "var(--color-ember)", textShadow: "0 0 7px var(--color-ember)" }}
              >
                {scene.layers.m}
              </pre>
              <pre
                aria-hidden
                style={{
                  color: "var(--color-ember-bright)",
                  textShadow: "0 0 10px rgb(255 210 122 / 0.9)",
                }}
              >
                {scene.layers.c}
              </pre>

              {PROVIDERS.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  aria-label={`Show ${p.name}`}
                  aria-pressed={i === sel}
                  onClick={() => choose(i)}
                  className="absolute m-0 cursor-pointer border-0 bg-transparent p-0"
                  style={{
                    left: `calc(${p.cx - 7} * 1ch)`,
                    top: "calc(6 * 1.15em)",
                    width: "calc(14 * 1ch)",
                    height: `calc(${ROWS - 6} * 1.15em)`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5 border border-line-soft bg-well px-[26px] pt-[26px] pb-[22px]">
            <div role="tablist" aria-label="Provider" className="flex flex-wrap gap-1.5">
              {PROVIDERS.map((p, i) => {
                const on = i === sel;
                return (
                  <button
                    key={p.short}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => choose(i)}
                    className="min-h-[34px] cursor-pointer rounded-[3px] border px-[11px] font-mono text-[12px] tracking-[0.03em] transition-colors"
                    style={{
                      borderColor: on ? "var(--color-ember)" : "var(--color-rim)",
                      background: on ? "rgb(255 178 63 / 0.08)" : "transparent",
                      color: on ? "var(--color-ember)" : "var(--color-dim)",
                    }}
                  >
                    {p.short}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4 sm:items-end">
              <div className="flex flex-col gap-1.5">
                <p className="text-[30px] font-semibold tracking-[-0.03em] text-bone">
                  {PROVIDERS[sel].name}
                </p>
                <p className="font-mono text-[12.5px] text-ember">
                  burning {compact(rates[sel])} tokens / hour
                </p>
              </div>
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <p className="text-[30px] font-semibold tracking-[-0.03em] text-bone">
                  {compact(todays[sel])}
                </p>
                <p className="eyebrow text-[11.5px] tracking-[0.06em]">TODAY</p>
              </div>
            </div>

            <div role="tablist" aria-label="Break down by" className="flex border-b border-edge">
              {DIMENSIONS.map((d, i) => {
                const on = i === dim;
                return (
                  <button
                    key={d.label}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setDim(i)}
                    className="-mb-px min-h-11 flex-1 cursor-pointer border-0 border-b-2 bg-transparent text-[14px] font-medium transition-colors"
                    style={{
                      borderBottomColor: on ? "var(--color-ember)" : "transparent",
                      color: on ? "var(--color-bone)" : "var(--color-label)",
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3.5">
              {rows.map((row) => (
                <div key={row.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between gap-3 text-[14px]">
                    <span className="truncate text-text">{row.name}</span>
                    <span className="flex-none font-mono text-[12.5px] text-dim">{row.value}</span>
                  </div>
                  <p className="overflow-hidden font-mono text-[12px] leading-none whitespace-pre">
                    <span className="text-ember">{row.bar}</span>
                    <span className="text-rim">{row.rest}</span>
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-auto font-mono text-[11px] text-mute">
              Example data. Your tower shows your own.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── one frame ──────────────────────────────────────────────────────────── */

function paint({
  frame,
  reduced,
  rates,
  sel,
  gazeX,
}: {
  frame: number;
  reduced: boolean;
  rates: number[];
  sel: number;
  gazeX: number;
}) {
  const canvas = new Canvas(ROWS, COLS);
  const put = (r: number, c: number, s: string, k: string) => canvas.text(r, c, s, k);
  const R = rng(reduced ? 5 : frame * 131 + 7);
  /** A second stream, seeded once, for everything that should never move. */
  const S = rng(99);

  // Sky and the ridge behind the tower.
  for (let n = 0; n < 40; n++) {
    const y = Math.floor(S() * 12);
    const x = Math.floor(S() * COLS);
    if (Math.abs(x - 61) > 9) put(y, x, S() < 0.3 ? "+" : ".", "s");
  }
  for (let x = 0; x < COLS; x++) {
    const y = 14 + Math.round(2.2 * Math.sin(x * 0.09) + 1.4 * Math.sin(x * 0.23 + 1));
    if (x % 2 === 0) put(y, x, x % 6 === 0 ? "^" : ".", "s");
  }

  TOWER.forEach((row, i) => put(i, TOWER_X, row, "t"));
  const lampChars = "#%8&";
  for (const dx of [5, 6, 9, 10]) put(3, TOWER_X + dx, lampChars.charAt(Math.floor(R() * 4)), "m");

  // The ground the fires are lit on.
  let ground = "";
  for (let x = 0; x < COLS; x++) ground += S() < 0.12 ? (S() < 0.5 ? "^" : ",") : "_";
  put(BASE + 2, 0, ground, "g");
  for (let x = 0; x < COLS; x++) if (S() < 0.18) put(BASE + 3, x, S() < 0.5 ? "." : "'", "s");

  // One campfire per provider. Height follows the burn rate; the core, the
  // body and the edge are three colours, so a big fire reads as hotter and
  // not just taller.
  const maxRate = PROVIDERS[0].rate;
  const tops: number[] = [];
  PROVIDERS.forEach((p, i) => {
    const h = Math.round(3 + 12 * Math.sqrt(rates[i] / maxRate));
    const cx = p.cx;
    tops.push(BASE - h);
    for (let k = 0; k < h; k++) {
      const y = BASE - k;
      const frac = k / h;
      const halfW = (1 - Math.pow(frac, 1.35)) * (1.6 + h * 0.36);
      const sway = Math.round(Math.sin(frame * 0.35 + k * 0.9 + i * 2) * 0.9 * frac);
      for (let dx = -Math.ceil(halfW); dx <= Math.ceil(halfW); dx++) {
        if (Math.abs(dx) > halfW + 0.2) continue;
        const heat =
          1 - (Math.abs(dx) / (halfW + 0.6)) * 0.65 - frac * 0.7 + (R() - 0.5) * 0.3;
        if (heat > 0.6) put(y, cx + dx + sway, "#@%&".charAt(Math.floor(R() * 4)), "c");
        else if (heat > 0.36) put(y, cx + dx + sway, "*&$%(){}".charAt(Math.floor(R() * 8)), "m");
        else if (heat > 0.12) put(y, cx + dx + sway, "^:;'\"`".charAt(Math.floor(R() * 6)), "e");
      }
    }
    // Sparks off the top, and the stones around the base.
    for (let s = 0; s < 3; s++) {
      if (R() < 0.6) {
        put(
          BASE - h - 1 - Math.floor(R() * 3),
          cx + Math.round((R() - 0.5) * 4),
          R() < 0.5 ? "." : "'",
          "m",
        );
      }
    }
    put(BASE + 1, cx - 3, "\\_/\\_/", "g");

    const on = i === sel;
    const name = on ? `> ${p.name} <` : p.name;
    put(BASE + 4, cx - Math.floor(name.length / 2), name, on ? "m" : "n");
    const rate = `${compact(rates[i])}/h`;
    put(BASE + 5, cx - Math.floor(rate.length / 2), rate, "l");
  });

  // The tower's gaze, part way through its pan to whichever fire is selected.
  const gx = Math.round(gazeX);
  const x0 = TOWER_X + (gx < TOWER_X + 6 ? 3 : 10);
  const y0 = 4;
  const x1 = gx;
  const y1 = Math.max(0, tops[sel] - 3);
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0) * 2);
  for (let s = 2; s < n; s += 2) {
    const y = Math.round(y0 + ((y1 - y0) * s) / n);
    const x = Math.round(x0 + ((x1 - x0) * s) / n);
    if (canvas.inside(y, x) && canvas.keys[y][x] !== "t") put(y, x, ".", "m");
  }
  put(y1, x1 - 2, "(", "m");
  put(y1, x1 + 2, ")", "m");
  put(y1 - 1, x1, "'", "m");

  return { layers: canvas.split(KEYS) as Record<(typeof KEYS)[number], string> };
}
