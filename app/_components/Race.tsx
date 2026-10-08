"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, rng } from "../_lib/ascii";
import { useFrames } from "../_lib/frames";
import { RACE_COLS, RACE_ROWS, paintPhoneRace } from "./PhoneRace";

/* ── Small by design ─────────────────────────────────────────────────────
   A race, three heats, where each side carries the memory it actually uses:
   a ranger with a pack on the trail, and something large towing a crate
   through the water below. The ranger finishes; the swimmer is still loading.

   The old version of this section was a bar chart with three rows and a
   footnote. The numbers are the same. The difference is that a 100× gap
   drawn as two bars is a fact you skim and a 100× gap drawn as a race is a
   fact you watch happen, and the second one is the one people repeat.

   Every figure is a reported measurement with its source named underneath;
   nothing here is a benchmark we ran.
   ─────────────────────────────────────────────────────────────────────── */

const COLS = 150;
const ROWS = 24;
/** Where the trail starts, and where the finish line is. */
const START = 3;
const FINISH = 140;
/** The countdown, then the ranger's run. */
const COUNT_MS = 1500;
const RUN_MS = 3400;
/* s scrub · g trail · w water · d dust · c crate · o swimmer · f finish · p pack · r ranger */
const KEYS = ["s", "g", "w", "d", "c", "o", "f", "p", "r"] as const;

/** What the other side is called here. Not its name, by choice. */
const RIVAL = "A delphinidae looking competitor";

const HEATS = [
  {
    label: "DESKTOP APP",
    ratio: 30,
    ours: "~50 MB",
    theirs: "~1.5 GB",
    oursMB: 50,
    theirsMB: 1500,
    oursLabel: "Firetower desktop",
    theirsLabel: `${RIVAL} · app + daemon, idle`,
    source: "macOS user report",
    sourceUrl: "https://github.com/stablyai/orca/issues/5386",
    pack: "[#]",
    crate: [".---------------------.", "|  app + daemon       |", "|  ~1.5 GB            |", "'---------------------'"],
  },
  {
    label: "AGENT WORKER",
    ratio: 100,
    ours: "5 MB",
    theirs: "~500 MB",
    oursMB: 5,
    theirsMB: 500,
    oursLabel: "Firetower worker",
    theirsLabel: `${RIVAL} · agent process, per agent`,
    source: "macOS user report; the agent CLI itself is not counted",
    sourceUrl: "https://github.com/stablyai/orca/issues/5386",
    pack: "[.]",
    crate: [".---------------------.", "|  agent process      |", "|  ~500 MB per agent  |", "'---------------------'"],
  },
  {
    label: "SERVER",
    ratio: 5,
    ours: "200 MB",
    theirs: "~1 GB",
    oursMB: 200,
    theirsMB: 1000,
    oursLabel: "Firetower control plane",
    theirsLabel: `${RIVAL} · service, after restart`,
    source: "Linux user report",
    sourceUrl: "https://github.com/stablyai/orca/issues/16084",
    pack: "[##]",
    crate: [".---------------------.", "|  service            |", "|  ~1 GB              |", "'---------------------'"],
  },
];

const RANGER = [
  ["  _/^\\_ ", "   (oo) ", " PK |\\  ", "    /\\  ", "   /  \\ "],
  ["  _/^\\_ ", "   (oo) ", " PK |\\  ", "    |\\  ", "    | \\ "],
];
const CHEER = ["  _/^\\_ ", " \\ (oo)/", " PK |   ", "    /\\  ", "   /  \\ "];

const SWIMMER = [
  "               /\\              ",
  "   ,_____.----'  '-------.__   ",
  " >=         (~~~)        o  `. ",
  "   '-.____________.--------'   ",
];

export function Race() {
  const host = useRef<HTMLElement>(null);
  const { frame, now, reduced } = useFrames(60, { watch: host });
  const [heat, setHeat] = useState(0);
  const [start, setStart] = useState(0);
  const [auto, setAuto] = useState(true);

  // The first race starts when the section comes into view, not on load.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setStart(Date.now() + 300);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // After a finish, move on to the next heat by itself until somebody picks one.
  useEffect(() => {
    if (!auto || !start || reduced) return;
    const over = start + COUNT_MS + RUN_MS + 4800 - Date.now();
    const id = window.setTimeout(() => {
      setHeat((h) => (h + 1) % HEATS.length);
      setStart(Date.now() + 200);
    }, Math.max(200, over));
    return () => window.clearTimeout(id);
  }, [auto, start, heat, reduced]);

  const current = HEATS[heat];
  let elapsed = start ? now - start : -1;
  if (reduced && start) elapsed = COUNT_MS + RUN_MS + 2000;
  const raceT = elapsed - COUNT_MS;
  const finished = raceT >= RUN_MS;

  // The ranger's progress, eased. The swimmer's is the same clock divided by the
  // ratio, which is the whole joke: it is running the same race at 1/100th
  // the speed because it is carrying a hundred times the weight.
  const linear = raceT <= 0 ? 0 : Math.min(1, raceT / RUN_MS);
  const ours = linear < 0.5 ? 2 * linear * linear : 1 - Math.pow(-2 * linear + 2, 2) / 2;
  const theirs = finished
    ? Math.min(1, Math.min(raceT, RUN_MS * 2.2) / RUN_MS / current.ratio)
    : ours / current.ratio;

  const running = raceT > 0 && !finished;
  const scene = useMemo(
    () => paint({ frame, reduced, heat, ours, theirs, finished, running }),
    [frame, reduced, heat, ours, theirs, finished, running],
  );
  const phone = useMemo(
    () =>
      paintPhoneRace({
        frame, reduced, ours, theirs, finished, running,
        pack: current.pack,
        carries: current.ours,
        crate: current.theirs,
      }),
    [frame, reduced, ours, theirs, finished, running, current],
  );

  let count = "";
  let countOpacity = 0;
  if (elapsed >= 0 && elapsed < COUNT_MS + 350 && !reduced) {
    const n = Math.floor(elapsed / 500);
    count = n < 3 ? String(3 - n) : "GO";
    countOpacity = n < 3 ? 1 - (elapsed % 500) / 700 : Math.max(0, 1 - (elapsed - COUNT_MS) / 350);
  }

  return (
    <section
      ref={host}
      id="race"
      aria-label="Small by design"
      className="pt-16 pb-16 sm:pt-24 sm:pb-26"
    >
      <div className="mx-auto flex max-w-(--shell) flex-col gap-9 px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-7">
          <div className="flex flex-[1_1_520px] flex-col gap-4">
            <p className="eyebrow">[ SMALL BY DESIGN ]</p>
            <h2 className="display h2">Written in Rust. No memory overhead.</h2>
            <p className="max-w-[560px] text-[17px] leading-[1.6] text-dim">
              A small core, no accumulating terminal daemons, and memory ceilings where the
              host supports them. In this race, each side carries the memory it uses.
            </p>
          </div>
          <div role="tablist" aria-label="Choose a race" className="flex flex-wrap gap-2">
            {HEATS.map((h, i) => {
              const on = i === heat;
              return (
                <button
                  key={h.label}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setHeat(i);
                    setStart(Date.now());
                    setAuto(false);
                  }}
                  className="flex min-w-[150px] cursor-pointer flex-col items-start gap-1 rounded-[3px] border px-4 py-3 text-left"
                  style={{
                    background: on ? "#141416" : "transparent",
                    borderColor: on ? "var(--color-ember)" : "var(--color-rim)",
                  }}
                >
                  <span
                    className="font-mono text-[12px] tracking-[0.08em]"
                    style={{ color: on ? "var(--color-ember)" : "var(--color-label)" }}
                  >
                    {h.label}
                  </span>
                  <span
                    className="text-[22px] font-semibold tracking-[-0.03em]"
                    style={{ color: on ? "var(--color-bone)" : "var(--color-soft)" }}
                  >
                    {h.ratio}×
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden border border-line-soft bg-sunk px-4 py-5 [container-type:inline-size] sm:block sm:px-6 sm:pt-7 sm:pb-[22px]">
          <p className="mb-2 font-mono text-[11.5px] tracking-[0.08em] text-mute sm:absolute sm:top-3.5 sm:left-4 sm:mb-0">
            FIRETOWER · carries {current.ours}
          </p>
          <p className="order-last mt-2 font-mono text-[11.5px] tracking-[0.08em] text-mute sm:absolute sm:bottom-3 sm:left-4 sm:mt-0">
            {RIVAL.toUpperCase()} · carries {current.theirs}
          </p>

          {/* The same race over forty-six columns: two sprites, a finish line
              and the gap between them, which is all it was ever about. */}
          <div
            aria-hidden
            className="ascii relative mx-auto w-[46ch] text-[8px] sm:hidden"
            style={{
              height: `calc(${RACE_ROWS} * 1.15em)`,
              fontSize: `min(13px, calc(100cqw / ${RACE_COLS * 0.62}))`,
            }}
          >
            <pre style={{ color: "#333338" }}>{phone.s}</pre>
            <pre style={{ color: "#5a5a60" }}>{phone.g}</pre>
            <pre style={{ color: "#3e4c5a" }}>{phone.w}</pre>
            <pre style={{ color: "var(--color-label)" }}>{phone.d}</pre>
            <pre style={{ color: "var(--color-soft)" }}>{phone.c}</pre>
            <pre style={{ color: "#d2d2d7" }}>{phone.o}</pre>
            <pre style={{ color: "var(--color-bone)" }}>{phone.f}</pre>
            <pre style={{ color: "var(--color-ember-soft)" }}>{phone.p}</pre>
            <pre style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}>
              {phone.r}
            </pre>
          </div>

          <div className="hidden justify-center sm:flex">
            <div
              aria-hidden
              className="ascii relative w-[150ch] text-[6px]"
              style={{ height: "calc(24 * 1.15em)", fontSize: "min(12px, calc(100cqw / 91))" }}
            >
              <pre style={{ color: "#333338" }}>{scene.layers.s}</pre>
              <pre style={{ color: "#5a5a60" }}>{scene.layers.g}</pre>
              <pre style={{ color: "#3e4c5a" }}>{scene.layers.w}</pre>
              <pre style={{ color: "var(--color-label)" }}>{scene.layers.d}</pre>
              <pre style={{ color: "var(--color-soft)" }}>{scene.layers.c}</pre>
              <pre style={{ color: "#d2d2d7" }}>{scene.layers.o}</pre>
              <pre style={{ color: "var(--color-bone)" }}>{scene.layers.f}</pre>
              <pre style={{ color: "var(--color-ember-soft)" }}>{scene.layers.p}</pre>
              <pre style={{ color: "var(--color-ember)", textShadow: "0 0 6px var(--color-ember)" }}>
                {scene.layers.r}
              </pre>
            </div>
          </div>

          {count && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <p
                className="text-[140px] font-semibold tracking-[-0.06em] text-bone [text-shadow:0_0_40px_var(--color-sunk)]"
                style={{ opacity: Math.max(0, countOpacity).toFixed(2) }}
              >
                {count}
              </p>
            </div>
          )}

          {finished && (
            <div
              className="absolute top-1/2 right-10 flex -translate-y-1/2 flex-col items-end gap-1.5 rounded border border-rim bg-sunk/90 px-[22px] py-[18px]"
              style={{ opacity: Math.min(1, (raceT - RUN_MS) / 400).toFixed(2) }}
            >
              <p className="font-mono text-[12px] tracking-[0.08em] text-ember">FIRETOWER FINISHED</p>
              <p className="text-[48px] leading-none font-semibold tracking-[-0.05em] text-bone">
                {current.ratio}× less memory
              </p>
              <p className="max-w-[270px] text-right text-[14px] text-dim">
                Same job. {RIVAL} is {Math.max(1, Math.round(theirs * 100))}% of the way
                there.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-14 gap-y-6">
          <div className="flex flex-[1_1_560px] flex-col gap-3.5 font-mono text-[13px]">
            {/* The label always takes a row of its own: one of these runs to
                thirty-odd characters, and squeezing it into a column beside
                the bar leaves no bar left to read. */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
              <span className="flex-none basis-full text-bone">{current.oursLabel}</span>
              <span className="h-2.5 flex-auto bg-[#141416]">
                <span
                  className="block h-2.5 min-w-[3px] bg-ember shadow-[0_0_10px_var(--color-ember)]"
                  style={{ width: `${Math.max(0.4, (current.oursMB / current.theirsMB) * 100).toFixed(2)}%` }}
                />
              </span>
              <span className="flex-none basis-24 text-right text-ember">{current.ours}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
              <span className="flex-none basis-full text-soft">{current.theirsLabel}</span>
              <span className="h-2.5 flex-auto bg-[#141416]">
                <span className="block h-2.5 w-full bg-[#4a4a50]" />
              </span>
              <span className="flex-none basis-24 text-right text-soft">{current.theirs}</span>
            </div>
            <p className="text-[11.5px] text-mute">
              Memory from a{" "}
              <a
                href={current.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-rim underline-offset-2 transition-colors hover:text-dim"
              >
                {current.source}
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStart(Date.now());
              setAuto(false);
            }}
            className="min-h-11 cursor-pointer rounded-[3px] border border-rim bg-transparent px-[18px] font-mono text-[13px] tracking-[0.04em] text-bone transition-colors hover:bg-raise"
          >
            RACE AGAIN
          </button>
        </div>

        <p aria-live="polite" className="sr-only">
          {finished
            ? `${current.label.toLowerCase()}: Firetower uses ${current.ours}, ${RIVAL} uses ${current.theirs}, ${current.ratio} times less memory.`
            : ""}
        </p>
      </div>
    </section>
  );
}

/* ── one frame ──────────────────────────────────────────────────────────── */

function paint({
  frame,
  reduced,
  heat,
  ours,
  theirs,
  finished,
  running,
}: {
  frame: number;
  reduced: boolean;
  heat: number;
  ours: number;
  theirs: number;
  finished: boolean;
  running: boolean;
}) {
  const current = HEATS[heat];
  const canvas = new Canvas(ROWS, COLS);
  const put = (r: number, c: number, s: string, k: string, solid = false) =>
    canvas.text(r, c, s, k, solid);
  /** Seeded once: the scenery must not shimmer while the racers move. */
  const R = rng(11);

  // The land lane: scrub, then the trail.
  for (let x = 6; x < COLS - 12; x += 3 + Math.floor(R() * 4)) {
    if (R() < 0.5) {
      put(2, x + 1, "^", "s");
      put(3, x, "/^\\", "s");
    } else {
      put(3, x + 1, "^", "s");
    }
  }
  let trail = "";
  for (let x = 0; x < COLS; x++) trail += R() < 0.08 ? (R() < 0.5 ? "." : ",") : "_";
  put(9, 0, trail, "g");

  // The water lane, with waves that actually move.
  for (const y of [11, 16, 21, 23]) {
    let line = "";
    for (let x = 0; x < COLS; x++) {
      const v =
        Math.sin(x * 0.33 + y * 1.7 - frame * 0.18) + 0.5 * Math.sin(x * 0.11 + frame * 0.07 + y);
      line += v > 1.15 ? "~" : v > 0.7 ? "-" : " ";
    }
    put(y, 0, line, "w");
  }

  // Start and finish.
  for (let y = 1; y < ROWS - 1; y++) {
    put(y, FINISH, y % 2 ? ":" : "|", "f");
    put(y, START - 1, ":", "s");
  }
  put(0, FINISH - 6, "FINISH", "f");
  put(0, FINISH + 1, "|>>", "f");
  put(1, FINISH + 1, "|>", "f");
  put(0, 0, "START", "s");

  // The ranger, with a pack the size of Firetower's memory.
  const sprite = finished ? CHEER : RANGER[running && !reduced ? (frame >> 1) % 2 : 0];
  const rx = START + Math.round(ours * (FINISH - START - 9));
  sprite.forEach((row, i) => {
    const slot = row.indexOf("PK");
    const line = slot >= 0 ? `${row.slice(0, slot)}  ${row.slice(slot + 2)}` : row;
    put(4 + i, rx, line, "r");
    if (slot >= 0) put(4 + i, rx + slot + 2 - current.pack.length, current.pack, "p");
  });
  put(3, rx, ` ${current.ours.replace("~", "")} `, "p", true);
  if (running) {
    put(8, rx - 2, R() < 0.5 ? "." : "o", "d");
    if ((frame >> 1) % 2) put(7, rx - 4, ".", "d");
  }

  // The swimmer, towing the competitor's memory on its back.
  const ox = START + Math.round(theirs * (FINISH - START - 32));
  const bob = reduced ? 0 : (frame >> 3) % 2;
  current.crate.forEach((row, i) => put(12 + i + bob, ox + 4, row, "c", true));
  SWIMMER.forEach((row, i) => put(16 + i + bob, ox, row, "o"));
  put(18 + bob, ox + 12, "(~~~)", "f");
  for (let w = 1; w < 7; w++) {
    if (R() < 0.6) put(18 + bob, ox - w, (frame + w) % 3 ? "~" : "-", "w");
  }
  if (!reduced) put(15 - ((frame >> 2) % 3), ox + 30, (frame >> 2) % 2 ? "o" : ".", "d");
  if (finished) put(16 + bob, ox + 33, "still loading...", "d");

  return { layers: canvas.split(KEYS) as Record<(typeof KEYS)[number], string> };
}
